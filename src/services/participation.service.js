import { DB_ERROR, ERROR_MESSAGE } from '#constants';
import { ConflictException, NotFoundException } from '#exceptions';

export class ParticipationService {
  #db;
  #participationRepository;
  #challengeRepository;

  constructor({ db, participationRepository, challengeRepository }) {
    this.#db = db;
    this.#participationRepository = participationRepository;
    this.#challengeRepository = challengeRepository;
  }

  async getParticipation({ challengeId, userId }) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    const participation =
      await this.#participationRepository.findByChallengeIdAndUserId({
        challengeId,
        userId,
      });
    if (!participation) {
      throw new NotFoundException(ERROR_MESSAGE.PARTICIPATION_NOT_FOUND);
    }

    return participation;
  }

  async joinChallenge({ challengeId, userId }) {
    return this.#db.transaction(async (tx) => {
      const challenge = await this.#challengeRepository.findByIdForUpdate(
        challengeId,
        { tx },
      );

      if (!challenge) {
        throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
      }

      if (challenge.status !== 'APPROVED') {
        throw new ConflictException(ERROR_MESSAGE.CHALLENGE_NOT_APPROVED);
      }

      if (new Date(challenge.deadlineAt) <= new Date()) {
        throw new ConflictException(ERROR_MESSAGE.CHALLENGE_CLOSED);
      }

      const participation =
        await this.#participationRepository.findByChallengeIdAndUserId(
          {
            challengeId,
            userId,
          },
          { tx },
        );

      if (participation) {
        throw new ConflictException(ERROR_MESSAGE.ALREADY_PARTICIPATING);
      }

      const count = await this.#participationRepository.countByChallengeId(
        challengeId,
        { tx },
      );

      if (count >= challenge.maxParticipants) {
        throw new ConflictException(ERROR_MESSAGE.CHALLENGE_FULL);
      }

      try {
        return await this.#participationRepository.create(
          {
            challengeId,
            userId,
          },
          { tx },
        );
      } catch (error) {
        if (error.sqlState === DB_ERROR.UNIQUE_VIOLATION) {
          throw new ConflictException(ERROR_MESSAGE.ALREADY_PARTICIPATING);
        }

        throw error;
      }
    });
  }

  async leaveChallenge({ challengeId, userId }) {
    const challenge = await this.#challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    if (new Date(challenge.deadlineAt) <= new Date()) {
      throw new ConflictException(ERROR_MESSAGE.CHALLENGE_CLOSED);
    }

    const participation =
      await this.#participationRepository.findByChallengeIdAndUserId({
        challengeId,
        userId,
      });

    if (!participation) {
      throw new NotFoundException(ERROR_MESSAGE.PARTICIPATION_NOT_FOUND);
    }

    await this.#participationRepository.deleteByChallengeIdAndUserId({
      challengeId,
      userId,
    });
  }

  async getParticipants({ challengeId, page, pageSize }) {
    const challenge = await this.#challengeRepository.findById(challengeId);

    if (!challenge || challenge.status !== 'APPROVED') {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    const participations =
      await this.#participationRepository.findAllWithSubmissionByChallengeId(
        challengeId,
      );
    const participants = participations
      .map(({ id, joinedAt, user, submission }) => ({
        id,
        user: user ?? null,
        submissionId: submission?.id ?? null,
        likeCount: submission?.likes ?? 0,
        submittedAt: submission?.submittedAt ?? null,
        joinedAt,
      }))
      .sort((a, b) => this.#compareParticipants(a, b));

    const totalCount = participants.length;
    const offset = (page - 1) * pageSize;

    return {
      items: participants.slice(offset, offset + pageSize),
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  // 참여 현황 정렬 : 제출자(좋아요 많은 순 → 먼저 제출한 순) → 미제출자(먼저 참여한 순)
  #compareParticipants(a, b) {
    const aSubmitted = a.submissionId !== null;
    const bSubmitted = b.submissionId !== null;

    if (aSubmitted !== bSubmitted) {
      return aSubmitted ? -1 : 1;
    }

    if (aSubmitted) {
      if (a.likeCount !== b.likeCount) {
        return b.likeCount - a.likeCount;
      }

      const submittedDiff = new Date(a.submittedAt) - new Date(b.submittedAt);

      if (submittedDiff !== 0) {
        return submittedDiff;
      }
    } else {
      const joinedDiff = new Date(a.joinedAt) - new Date(b.joinedAt);

      if (joinedDiff !== 0) {
        return joinedDiff;
      }
    }

    return a.id - b.id;
  }
}
