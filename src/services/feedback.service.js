import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

const NOTIFICATION_RULES = {
  FEEDBACK_RECEIVED: {
    type: 'FEEDBACK_RECEIVED',
    message: (title) =>
      `'${title}' 챌린지의 내 작업물에 새 피드백이 등록되었습니다.`,
  },
  FEEDBACK_CHANGED: {
    type: 'FEEDBACK_CHANGED',
    message: (title) =>
      `관리자가 '${title}' 챌린지에 남긴 내 피드백을 수정했습니다.`,
  },
  FEEDBACK_DELETED: {
    type: 'FEEDBACK_DELETED',
    message: (title, reason) =>
      `관리자가 '${title}' 챌린지에 남긴 내 피드백을 삭제했습니다. (사유: ${reason})`,
  },
};

export class FeedbackService {
  #db;
  #feedbackRepository;
  #submissionRepository;
  #challengeRepository;
  #notificationRepository;

  constructor({
    db,
    feedbackRepository,
    submissionRepository,
    challengeRepository,
    notificationRepository,
  }) {
    this.#db = db;
    this.#feedbackRepository = feedbackRepository;
    this.#submissionRepository = submissionRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationRepository = notificationRepository;
  }

  async getFeedbacks(submissionId, page = 1, pageSize = 10) {
    page = Number(page);
    pageSize = Number(pageSize);
    const offset = (page - 1) * pageSize;

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100 ||
      !Number.isSafeInteger(offset)
    ) {
      throw new BadRequestException(
        '페이지와 페이지 크기는 유효한 양의 정수여야 합니다',
      );
    }

    const submission = await this.#submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundException('제출물을 찾을 수 없습니다');
    }

    const [items, totalCount] = await Promise.all([
      this.#feedbackRepository.findAll(submissionId, {
        offset,
        limit: pageSize,
      }),
      this.#feedbackRepository.countFeedbacks(submissionId),
    ]);
    return {
      items,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  async createFeedback(submissionId, authorId, content) {
    return this.#db.transaction(async (tx) => {
      // 연결 ID를 조회한 뒤 챌린지 → 제출물 순서로 잠급니다.
      const existingSubmission =
        await this.#submissionRepository.findChallengeIdById(submissionId, {
          tx,
        });
      if (!existingSubmission) {
        throw new NotFoundException('제출물을 찾을 수 없습니다');
      }
      const challenge = await this.#challengeRepository.findByIdForUpdate(
        existingSubmission.challengeId,
        { tx },
      );
      if (!challenge) {
        throw new NotFoundException('챌린지를 찾을 수 없습니다');
      }

      const submission = await this.#submissionRepository.findByIdForUpdate(
        submissionId,
        { tx },
      );
      if (!submission) {
        throw new NotFoundException('제출물을 찾을 수 없습니다');
      }

      if (submission.challengeId !== existingSubmission.challengeId) {
        throw new ConflictException(
          '작업물의 챌린지가 변경되었습니다. 다시 시도해주세요.',
        );
      }

      if (challenge.status !== 'APPROVED') {
        throw new ConflictException(
          '승인된 챌린지의 제출물에만 피드백을 작성할 수 있습니다.',
        );
      }

      const feedback = await this.#feedbackRepository.create(
        submissionId,
        authorId,
        content,
        {
          tx,
        },
      );

      // 작업물 작성자에게 알림. (본인 작업물에 단 피드백이거나 작성자가 탈퇴한 경우 생략)
      const submissionAuthorId = submission.participation?.user?.id ?? null;
      if (submissionAuthorId && submissionAuthorId !== authorId) {
        await this.#notificationRepository.create(
          {
            recipientId: submissionAuthorId,
            type: NOTIFICATION_RULES.FEEDBACK_RECEIVED.type,
            message: NOTIFICATION_RULES.FEEDBACK_RECEIVED.message(
              challenge.title,
            ),
            challengeId: challenge.id,
            submissionId: submission.id,
            feedbackId: feedback.id,
          },
          { tx },
        );
      }

      return feedback;
    });
  }

  async updateFeedback(feedbackId, userId, userRole, content) {
    return this.#db.transaction(async (tx) => {
      const { challenge, feedback } = await this.#validateFeedbackChange(
        feedbackId,
        userId,
        userRole,
        '수정',
        { tx },
      );
      const updated = await this.#feedbackRepository.update(
        feedbackId,
        content,
        { tx },
      );

      // 관리자가 남의 피드백을 수정한 경우에만 작성자에게 알림
      if (feedback.authorId && feedback.authorId !== userId) {
        await this.#notificationRepository.create(
          {
            recipientId: feedback.authorId,
            type: NOTIFICATION_RULES.FEEDBACK_CHANGED.type,
            message: NOTIFICATION_RULES.FEEDBACK_CHANGED.message(
              challenge.title,
            ),
            challengeId: challenge.id,
            submissionId: feedback.submissionId,
            feedbackId: feedback.id,
          },
          { tx },
        );
      }

      return updated;
    });
  }

  async deleteFeedback(feedbackId, userId, userRole, reason) {
    return this.#db.transaction(async (tx) => {
      const { challenge, feedback } = await this.#validateFeedbackChange(
        feedbackId,
        userId,
        userRole,
        '삭제',
        { tx },
      );

      // 관리자가 남의 피드백을 삭제하는 경우 (작성자가 탈퇴한 경우 포함)
      const isDeletedByAdmin =
        userRole === 'ADMIN' && feedback.authorId !== userId;
      if (isDeletedByAdmin && !reason) {
        throw new BadRequestException('삭제 사유를 입력해주세요.');
      }

      const deleted = await this.#feedbackRepository.delete(feedbackId, {
        tx,
      });

      // 작성자가 탈퇴했으면 받을 사람이 없으므로 알림 생략
      if (isDeletedByAdmin && feedback.authorId) {
        await this.#notificationRepository.create(
          {
            recipientId: feedback.authorId,
            type: NOTIFICATION_RULES.FEEDBACK_DELETED.type,
            message: NOTIFICATION_RULES.FEEDBACK_DELETED.message(
              challenge.title,
              reason,
            ),
            challengeId: challenge.id,
            submissionId: feedback.submissionId,
          },
          { tx },
        );
      }

      return deleted;
    });
  }

  async #validateFeedbackChange(feedbackId, userId, userRole, action, { tx }) {
    // 연결 ID를 확인한 뒤 챌린지 → 제출물 → 피드백 순서로 잠급니다.
    const existingFeedback = await this.#feedbackRepository.findById(
      feedbackId,
      {
        tx,
      },
    );
    if (!existingFeedback) {
      throw new NotFoundException('피드백을 찾을 수 없습니다');
    }

    const existingSubmission =
      await this.#submissionRepository.findChallengeIdById(
        existingFeedback.submissionId,
        { tx },
      );
    if (!existingSubmission) {
      throw new NotFoundException('제출물을 찾을 수 없습니다');
    }

    const challenge = await this.#challengeRepository.findByIdForUpdate(
      existingSubmission.challengeId,
      { tx },
    );
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다');
    }

    const submission =
      await this.#submissionRepository.findReferenceByIdForUpdate(
        existingFeedback.submissionId,
        { tx },
      );
    if (!submission) {
      throw new NotFoundException('제출물을 찾을 수 없습니다');
    }

    const feedback = await this.#feedbackRepository.findByIdForUpdate(
      feedbackId,
      { tx },
    );
    if (!feedback) {
      throw new NotFoundException('피드백을 찾을 수 없습니다');
    }

    if (userRole !== 'ADMIN' && feedback.authorId !== userId) {
      throw new ForbiddenException(
        `본인이 작성한 피드백만 ${action}할 수 있습니다.`,
      );
    }

    if (challenge.status !== 'APPROVED') {
      throw new ConflictException(
        `승인된 챌린지의 피드백만 ${action}할 수 있습니다.`,
      );
    }

    return { challenge, feedback };
  }
}
