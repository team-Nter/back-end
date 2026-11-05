import { DB_ERROR } from '#constants';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

export class SubmissionService {
  #db;
  #submissionRepository;
  #challengeRepository;
  #participationRepository;

  constructor({
    db,
    submissionRepository,
    challengeRepository,
    participationRepository,
  }) {
    this.#db = db;
    this.#submissionRepository = submissionRepository;
    this.#challengeRepository = challengeRepository;
    this.#participationRepository = participationRepository;
  }

  // 작업물 단일 조회
  async getSubmission(submissionId) {
    const submission = await this.#submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    const { likes, feedbacks, participation, ...rest } = submission;
    const user = participation.user;
    //isLiked는 1차 mvp 내의 내용이 아닌고로 이후 작성

    return {
      ...rest,
      likeCount: likes,
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

  async getParticipantSubmission(challengeId, userId) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    const participation =
      await this.#participationRepository.findByChallengeIdAndUserId({
        challengeId,
        userId,
      });
    if (!participation) {
      throw new NotFoundException('참여 정보를 찾을 수 없습니다.');
    }

    if (!participation.submission) {
      return { submission: null };
    }

    const { likes, feedbacks, ...submission } = participation.submission;
    return {
      submission: {
        ...submission,
        author: participation.user ?? null,
        likeCount: likes,
        feedbackCount: feedbacks,
      },
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
      await this.#validateSubmissionChange(
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

      return submission;
    });
  }

  async deleteSubmission(submissionId, userId, userRole) {
    return this.#db.transaction(async (tx) => {
      await this.#validateSubmissionChange(
        submissionId,
        userId,
        userRole,
        '삭제',
        {
          tx,
        },
      );
      await this.#submissionRepository.delete(submissionId, { tx });
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

    if (userRole === 'ADMIN') return;

    const authorId = submission.participation?.user?.id;
    if (authorId === undefined || authorId === null || authorId !== userId) {
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
  }
}
