import { DB_ERROR, ERROR_MESSAGE } from '#constants';
import { ConflictException, NotFoundException } from '#exceptions';

export class ParticipationService {
  #participationRepository;
  #challengeRepository;

  constructor({ participationRepository, challengeRepository }) {
    this.#participationRepository = participationRepository;
    this.#challengeRepository = challengeRepository;
  }

  async joinChallenge({ challengeId, userId }) {
    const challenge = await this.#challengeRepository.findById(challengeId);

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
      await this.#participationRepository.findByChallengeIdAndUserId({
        challengeId,
        userId,
      });

    if (participation) {
      throw new ConflictException(ERROR_MESSAGE.ALREADY_PARTICIPATING);
    }

    const count =
      await this.#participationRepository.countByChallengeId(challengeId);

    if (count >= challenge.maxParticipants) {
      throw new ConflictException(ERROR_MESSAGE.CHALLENGE_FULL);
    }

    try {
      return await this.#participationRepository.create({
        challengeId,
        userId,
      });
    } catch (error) {
      if (error.sqlState === DB_ERROR.UNIQUE_VIOLATION) {
        throw new ConflictException(ERROR_MESSAGE.ALREADY_PARTICIPATING);
      }

      throw error;
    }
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
}
