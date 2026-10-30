import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

export class SubmissionService {
  #submissionRepository;

  constructor({ submissionRepository }) {
    this.#submissionRepository = submissionRepository;
  }

  // 작업물 단일 조회
  async getSubmission(submissionId) {
    const submission = await this.#submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    const { likes, participation, ...rest } = submission;
    const user = participation.user;
    //isLiked는 1차 mvp 내의 내용이 아닌고로 이후 작성

    return {
      ...rest,
      likeCount: likes,
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
    // 관련 사항들은 차후 validate 쪽에 들어갈 것.
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
    const totalPage = Math.ceil(totalCount / pageSize);

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
      totalPage,
    };
    return { items, pagination };
  }

  async createSubmission(challengeId, data) {
    // TODO: 실험용 body 입력 대신 로그인 사용자의 참여 기록으로 검증·대체
    const submission = await this.#submissionRepository.create(
      challengeId,
      data,
    );

    if (!submission) {
      throw new Error('작업물 생성에 실패했습니다');
    }

    const { participation, ...rest } = submission;

    const user = participation.user;

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
  }

  async updateSubmission(submissionId, userId, data) {
    const existingSubmission =
      await this.#submissionRepository.findById(submissionId);

    if (!existingSubmission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    const authorId = existingSubmission.participation?.user?.id;
    if (authorId === undefined || authorId === null || authorId !== userId) {
      throw new ForbiddenException('본인이 작성한 작업물만 수정이 가능합니다');
    }

    const submission = await this.#submissionRepository.update(
      submissionId,
      data,
    );
    if (!submission) {
      throw new Error('작업물 수정에 실패했습니다.');
    }

    return submission;
  }

  async deleteSubmission(submissionId, userId) {
    const existingSubmission =
      await this.#submissionRepository.findById(submissionId);
    if (!existingSubmission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    const authorId = existingSubmission.participation?.user?.id;
    if (authorId === undefined || authorId === null || authorId !== userId) {
      throw new ForbiddenException('본인이 작성한 작업물만 삭제가 가능합니다');
    }

    await this.#submissionRepository.delete(submissionId);
  }
}
