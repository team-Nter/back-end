import { NotFoundException } from '#exceptions';

export class SubmissionLikeService {
  #db;
  #submissionLikeRepository;
  #submissionRepository;

  constructor({ db, submissionLikeRepository, submissionRepository }) {
    this.#db = db;
    this.#submissionLikeRepository = submissionLikeRepository;
    this.#submissionRepository = submissionRepository;
  }

  createSubmissionLike(userId, submissionId) {
    return this.#db.transaction(async (tx) => {
      const submission = await this.#submissionRepository.findIdForKeyShare(
        submissionId,
        { tx },
      );
      if (!submission) {
        throw new NotFoundException('작성물을 찾을 수 없습니다.');
      }

      await this.#submissionLikeRepository.create(userId, submissionId, { tx });
      const likeCount = await this.#submissionRepository.countLikesBySubmissionId(
        submissionId,
        { tx },
      );
      return { likeCount };
    });
  }

  deleteSubmissionLike(userId, submissionId) {
    return this.#db.transaction(async (tx) => {
      const submission = await this.#submissionRepository.findIdForKeyShare(
        submissionId,
        { tx },
      );
      if (!submission) {
        throw new NotFoundException('작성물을 찾을 수 없습니다.');
      }

      await this.#submissionLikeRepository.delete(userId, submissionId, { tx });
      const likeCount = await this.#submissionRepository.countLikesBySubmissionId(
        submissionId,
        { tx },
      );
      return { likeCount };
    });
  }
}
