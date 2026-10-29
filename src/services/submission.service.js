import { NotFoundException } from '#exceptions';

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
    const submissions =
      await this.#submissionRepository.findByChallengeId(challengeId);
    if (!submissions) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    page = Number(page);
    pageSize = Number(pageSize);
    const totalCount = submissions.length;
    const totalPage = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;

    const items = submissions
      .slice(startIndex, startIndex + pageSize)
      .map((submission) => {
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
    const submission = await this.#submissionRepository.create(challengeId, data);

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
}
