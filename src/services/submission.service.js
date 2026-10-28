import { NotFoundException } from '#exceptions';

export class SubmissionService {
  #submissionRepository;

  constructor({ submissionRepository }) {
    this.#submissionRepository = submissionRepository;
  }

  // 작업물 단일 조회
  async getSubmission(submissionId) {
    const submission = await this.#submissionRepository.findById(submissionId);

    const { likes, participation, ...rest } = submission;
    const user = participation.user;
    let isLiked = false;
    if (likes > 0) {
      isLiked = true;
    }
    if (!submission) {
      throw new NotFoundException('작업물을 찾을 수 없습니다');
    }

    return {
      ...rest,
      likeCount: likes,
      isLiked,
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
