import { DB_ERROR } from '#constants';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

const NOTIFICATION_RULES = {
  SUBMISSION_RECEIVED: {
    type: 'SUBMISSION_RECEIVED',
    message: (title) => `'${title}' 챌린지에 새 작업물이 제출되었습니다.`,
  },
  SUBMISSION_CHANGED: {
    type: 'SUBMISSION_CHANGED',
    message: (title) =>
      `관리자가 '${title}' 챌린지의 내 작업물을 수정했습니다.`,
  },
  SUBMISSION_DELETED: {
    type: 'SUBMISSION_DELETED',
    message: (title) =>
      `관리자가 '${title}' 챌린지의 내 작업물을 삭제했습니다.`,
  },
};

export class SubmissionService {
  #db;
  #submissionRepository;
  #submissionLikeRepository;
  #challengeRepository;
  #participationRepository;
  #notificationRepository;

  constructor({
    db,
    submissionRepository,
    submissionLikeRepository,
    challengeRepository,
    participationRepository,
    notificationRepository,
  }) {
    this.#db = db;
    this.#submissionRepository = submissionRepository;
    this.#submissionLikeRepository = submissionLikeRepository;
    this.#challengeRepository = challengeRepository;
    this.#participationRepository = participationRepository;
    this.#notificationRepository = notificationRepository;
  }

  // 작업물 단일 조회
  async getSubmission(submissionId, userId) {
    const submission = await this.#submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    const like =
      await this.#submissionLikeRepository.findByUserIdAndSubmissionId(
        userId,
        submissionId,
      );

    const { likes, feedbacks, participation, ...rest } = submission;
    const user = participation.user;

    return {
      ...rest,
      likeCount: likes,
      isLiked: Boolean(like),
      feedbackCount: feedbacks,
      author: user
        ? {
            id: user.id,
            nickname: user.nickname,
            grade: user.grade,
          }
        : null,
    };
  }

  async getSubmissions(challengeId, page = 1, pageSize = 1) {
    const challenge = await this.#challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

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

    const [submissions, totalCount] = await Promise.all([
      this.#submissionRepository.findByChallengeId(challengeId, {
        offset,
        limit: pageSize,
      }),
      this.#submissionRepository.countByChallengeId(challengeId),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);

    const items = submissions.map((submission) => {
      const user = submission.participation.user;

      return {
        id: submission.id,
        challengeId: submission.challengeId,
        title: submission.title,
        isSelected: submission.isSelected,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        author: user
          ? {
              id: user.id,
              nickname: user.nickname,
              grade: user.grade,
            }
          : null,
        likeCount: submission.likes,
        feedbackCount: submission.feedbacks,
      };
    });

    const pagination = {
      page,
      pageSize,
      totalCount,
      totalPages,
    };
    return { items, pagination };
  }

  async createSubmission(challengeId, userId, data) {
    return this.#db.transaction(async (tx) => {
      const challenge = await this.#challengeRepository.findByIdForUpdate(
        challengeId,
        { tx },
      );

      if (!challenge) {
        throw new NotFoundException('챌린지를 찾을 수 없습니다');
      }

      if (
        challenge.status !== 'APPROVED' ||
        new Date(challenge.deadlineAt).getTime() <= Date.now()
      ) {
        throw new ConflictException('제출할 수 없는 챌린지입니다.');
      }

      // 참여 관련
      const participation =
        await this.#participationRepository.findByChallengeIdAndUserIdForUpdate(
          { challengeId, userId },
          { tx },
        );
      if (!participation) {
        throw new ForbiddenException(
          '챌린지 참여자만 작업물을 제출할 수 있습니다.',
        );
      }

      let submission;

      try {
        submission = await this.#submissionRepository.create(
          challengeId,
          {
            title: data.title,
            content: data.content,
            participationId: participation.id,
          },
          { tx },
        );
      } catch (error) {
        if (error.sqlState === DB_ERROR.UNIQUE_VIOLATION) {
          throw new ConflictException('이미 제출한 작업물이 있습니다.');
        }

        throw error;
      }

      if (!submission) {
        throw new Error('작업물 생성에 실패했습니다.');
      }

      // 참여자 및 챌린지 신청자(requestorId) 알람 전송
      const participantIds =
        await this.#participationRepository.findUserIdsByChallengeId(
          challenge.id,
          { tx },
        );
      const recipientIds = new Set(participantIds);
      if (challenge.requestorId) recipientIds.add(challenge.requestorId);
      recipientIds.delete(userId);

      await this.#notificationRepository.createMany(
        [...recipientIds].map((recipientId) => ({
          recipientId,
          type: NOTIFICATION_RULES.SUBMISSION_RECEIVED.type,
          message: NOTIFICATION_RULES.SUBMISSION_RECEIVED.message(
            challenge.title,
          ),
          challengeId: challenge.id,
          submissionId: submission.id,
        })),
        { tx },
      );

      const { participation: authorParticipation, ...rest } = submission;
      const user = authorParticipation.user;

      return {
        ...rest,
        author: user
          ? {
              id: user.id,
              nickname: user.nickname,
              grade: user.grade,
            }
          : null,
      };
    });
  }

  async updateSubmission(submissionId, userId, data, userRole) {
    // 검증 구간에서 트랜잭션 필요하기에 나눔.
    return this.#db.transaction(async (tx) => {
      const { challenge, authorId } = await this.#validateSubmissionChange(
        submissionId,
        userId,
        userRole,
        '수정',
        {
          tx,
        },
      );

      const submission = await this.#submissionRepository.update(
        submissionId,
        { title: data.title, content: data.content },
        { tx },
      );
      if (!submission) {
        throw new Error('작업물 수정에 실패했습니다.');
      }

      // 관리자가 남의 작업물을 수정한 경우에만 작성자에게 알림
      // 본인이 수정한 경우에는 알람을 보내지 않음.
      if (authorId && authorId !== userId) {
        await this.#notificationRepository.create(
          {
            recipientId: authorId,
            type: NOTIFICATION_RULES.SUBMISSION_CHANGED.type,
            message: NOTIFICATION_RULES.SUBMISSION_CHANGED.message(
              challenge.title,
            ),
            challengeId: challenge.id,
            submissionId: submission.id,
          },
          { tx },
        );
      }
      return submission;
    });
  }

  async deleteSubmission(submissionId, userId, userRole) {
    return this.#db.transaction(async (tx) => {
      const { challenge, authorId } = await this.#validateSubmissionChange(
        submissionId,
        userId,
        userRole,
        '삭제',
        {
          tx,
        },
      );
      await this.#submissionRepository.delete(submissionId, { tx });

      // 관리자가 남의 작업물을 삭제한 경우에만 작성자에게 알림
      if (authorId && authorId !== userId) {
        await this.#notificationRepository.create(
          {
            recipientId: authorId,
            type: NOTIFICATION_RULES.SUBMISSION_DELETED.type,
            message: NOTIFICATION_RULES.SUBMISSION_DELETED.message(
              challenge.title,
            ),
            challengeId: challenge.id,
          },
          { tx },
        );
      }
    });
  }

  async #validateSubmissionChange(
    submissionId,
    userId,
    userRole,
    action,
    { tx },
  ) {
    const existingSubmission = await this.#submissionRepository.findById(
      submissionId,
      { tx },
    );
    if (!existingSubmission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    const challenge = await this.#challengeRepository.findByIdForUpdate(
      existingSubmission.challengeId,
      { tx },
    );
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    const submission = await this.#submissionRepository.findByIdForUpdate(
      submissionId,
      { tx },
    );
    if (!submission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    // ADMIN이면 선정된 것이든, 진행 중 또는 마감되었든 수정 및 삭제가 가능해야 함.

    // 탈퇴한 작성자면 null
    const authorId = submission.participation?.user?.id ?? null;

    if (userRole === 'ADMIN') return { challenge, authorId };

    if (authorId === null || authorId !== userId) {
      throw new ForbiddenException(
        `본인이 작성한 작업물만 ${action}이 가능합니다`,
      );
    }

    if (
      challenge.status !== 'APPROVED' ||
      new Date(challenge.deadlineAt).getTime() <= Date.now()
    ) {
      throw new ConflictException(
        '마감되었거나 진행 중이 아닌 챌린지의 작업물은 수정하거나 삭제할 수 없습니다.',
      );
    }

    if (submission.isSelected) {
      throw new ConflictException(
        '선정된 작업물은 수정하거나 삭제할 수 없습니다.',
      );
    }
    return { challenge, authorId };
  }
}
