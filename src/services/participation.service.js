// import { ERROR_MESSAGE } from '#constants';
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
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    if (challenge.status !== 'APPROVED') {
      throw new ConflictException('아직 승인 되지 않은 챌린지입니다.');
    }

    if (new Date(challenge.deadlineAt) <= new Date()) {
      throw new ConflictException('이미 마감된 챌린지입니다.');
    }

    const participation =
      await this.#participationRepository.findByChallengeIdAndUserId({
        challengeId,
        userId,
      });

    if (participation) {
      throw new ConflictException('이미 참여중인 챌린지입니다.');
    }

    const count =
      await this.#participationRepository.countByChallengeId(challengeId);

    if (count >= challenge.maxParticipants) {
      throw new ConflictException('챌린지의 참여 정원이 초과되었습니다');
    }

    return this.#participationRepository.create({ challengeId, userId });
  }

  leaveChallenge({ challengeId, userId }) {}
}
