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

    return submission;
  }
}
