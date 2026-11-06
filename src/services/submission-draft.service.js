import { ConflictException, NotFoundException } from '#exceptions';

export class SubmissionDraftService {
  #db;
  #submissionDraftRepository;
  #challengeRepository;
  #participationRepository;

  constructor({
    db,
    submissionDraftRepository,
    challengeRepository,
    participationRepository,
  }) {
    this.#db = db;
    this.#submissionDraftRepository = submissionDraftRepository;
    this.#challengeRepository = challengeRepository;
    this.#participationRepository = participationRepository;
  }

  async getSubmissionDraft(challengeId, userId) {
    const participation =
      await this.#participationRepository.findByChallengeIdAndUserId({
        challengeId,
        userId,
      });
    if (!participation) {
      throw new NotFoundException('해당 챌린지의 참여를 확인할 수 없습니다.');
    }

    const submissionDraft =
      await this.#submissionDraftRepository.findByParticipationId(
        participation.id,
      );

    return {
      challengeId,
      submissionDraft,
    };
  }

  async putSubmissionDraft(challengeId, userId, title, content) {
    return this.#db.transaction(async (tx) => {
      const challenge = await this.#challengeRepository.findByIdForUpdate(
        challengeId,
        { tx },
      );

      if (!challenge) {
        throw new NotFoundException('챌린지를 찾을 수 없습니다.');
      }

      if (
        challenge.status !== 'APPROVED' ||
        new Date(challenge.deadlineAt).getTime() <= Date.now()
      ) {
        throw new ConflictException('저장할 수 없는 챌린지입니다.');
      }

      const participation =
        await this.#participationRepository.findByChallengeIdAndUserIdForUpdate(
          { challengeId, userId },
          { tx },
        );

      if (!participation) {
        throw new NotFoundException('챌린지 참여자를 찾을 수 없습니다.');
      }

      const submissionDraft = await this.#submissionDraftRepository.upsert(
        participation.id,
        { title, content },
        { tx },
      );

      return {
        challengeId,
        submissionDraft,
      };
    });
  }

  async deleteSubmissionDraft(challengeId, userId) {
    return this.#db.transaction(async (tx) => {
      const challenge = await this.#challengeRepository.findByIdForUpdate(
        challengeId,
        { tx },
      );

      if (!challenge) {
        throw new NotFoundException('챌린지를 찾을 수 없습니다.');
      }

      if (
        challenge.status !== 'APPROVED' ||
        new Date(challenge.deadlineAt).getTime() <= Date.now()
      ) {
        throw new ConflictException('삭제할 수 없는 챌린지입니다.');
      }

      const participation =
        await this.#participationRepository.findByChallengeIdAndUserIdForUpdate(
          { challengeId, userId },
          { tx },
        );
      if (!participation) {
        throw new NotFoundException('챌린지 참여자를 찾을 수 없습니다.');
      }

      await this.#submissionDraftRepository.delete(participation.id, { tx });
    });
  }
}
