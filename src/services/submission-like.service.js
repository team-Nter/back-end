import { ConflictException, NotFoundException } from '#exceptions';

export class SubmissionLikeService {
  #db;
  #submissionLikeRepository;
  #submissionRepository;
  #challengeRepository;

  constructor({
    db,
    submissionLikeRepository,
    submissionRepository,
    challengeRepository,
  }) {
    this.#db = db;
    this.#submissionLikeRepository = submissionLikeRepository;
    this.#submissionRepository = submissionRepository;
    this.#challengeRepository = challengeRepository;
  }

  createSubmissionLike(userId, submissionId) {
    return this.#db.transaction(async (tx) => {
      await this.#validateLikeAllowed(submissionId, tx);

      await this.#submissionLikeRepository.create(userId, submissionId, { tx });
      const likeCount =
        await this.#submissionRepository.countLikesBySubmissionId(
          submissionId,
          { tx },
        );
      return { likeCount };
    });
  }

  deleteSubmissionLike(userId, submissionId) {
    return this.#db.transaction(async (tx) => {
      await this.#validateLikeAllowed(submissionId, tx);

      await this.#submissionLikeRepository.delete(userId, submissionId, { tx });
      const likeCount =
        await this.#submissionRepository.countLikesBySubmissionId(
          submissionId,
          { tx },
        );
      return { likeCount };
    });
  }
  async #validateLikeAllowed(submissionId, tx) {
    const reference = await this.#submissionRepository.findChallengeIdById(
      submissionId,
      { tx },
    );
    if (!reference) {
      throw new NotFoundException('작성물을 찾을 수 없습니다.');
    }

    const challenge =
      await this.#challengeRepository.findStatusAndDeadlineForShare(
        reference.challengeId,
        { tx },
      );
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    if (
      challenge.status !== 'APPROVED' ||
      new Date(challenge.deadlineAt).getTime() <= Date.now()
    ) {
      throw new ConflictException('미승인 또는 마감된 챌린지입니다.');
    }

    const submission = await this.#submissionRepository.findIdForKeyShare(
      submissionId,
      { tx },
    );
    if (!submission) {
      throw new NotFoundException('작성물을 찾을 수 없습니다.');
    }
  }
}
