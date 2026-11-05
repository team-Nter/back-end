import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

export class FeedbackService {
  #db;
  #feedbackRepository;
  #submissionRepository;
  #challengeRepository;

  constructor({
    db,
    feedbackRepository,
    submissionRepository,
    challengeRepository,
  }) {
    this.#db = db;
    this.#feedbackRepository = feedbackRepository;
    this.#submissionRepository = submissionRepository;
    this.#challengeRepository = challengeRepository;
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

      const submission =
        await this.#submissionRepository.findReferenceByIdForUpdate(
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

      return await this.#feedbackRepository.create(
        submissionId,
        authorId,
        content,
        {
          tx,
        },
      );
    });
  }

  async updateFeedback(feedbackId, userId, userRole, content) {
    return this.#db.transaction(async (tx) => {
      await this.#validateFeedbackChange(feedbackId, userId, userRole, '수정', {
        tx,
      });
      return await this.#feedbackRepository.update(feedbackId, content, { tx });
    });
  }

  async deleteFeedback(feedbackId, userId, userRole) {
    return this.#db.transaction(async (tx) => {
      await this.#validateFeedbackChange(feedbackId, userId, userRole, '삭제', {
        tx,
      });
      return await this.#feedbackRepository.delete(feedbackId, { tx });
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
  }
}
