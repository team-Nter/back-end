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
}
