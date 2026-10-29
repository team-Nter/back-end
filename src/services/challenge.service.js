import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

const MY_CHALLENGE_FILTERS = {
  requested: (userId) => ({
    requestorId: userId,
    statuses: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'],
  }),
  participating: (userId) => ({
    participantUserId: userId,
    statuses: ['APPROVED'],
    state: 'progress',
  }),
  completed: (userId) => ({
    participantUserId: userId,
    statuses: ['APPROVED'],
    state: 'closed',
  }),
};

export class ChallengeService {
  #challengeRepository;

  constructor({ challengeRepository }) {
    this.#challengeRepository = challengeRepository;
  }

  async createChallenge(userId, data) {
    const challenge = await this.#challengeRepository.create({
      ...data,
      requestorId: userId,
    });
    return challenge;
  }

  async getMyChallenges(userId, type, { page, pageSize, keyword }) {
    const typeFilters = MY_CHALLENGE_FILTERS[type](userId);

    const filters = { ...typeFilters, keyword };

    const [items, { total }] = await Promise.all([
      this.#challengeRepository.findMany({ page, pageSize, ...filters }),
      this.#challengeRepository.count(filters),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalCount: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getMyChallengeDetail(id, userId) {
    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge || challenge.requestorId !== userId) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    const isPending = challenge.status === 'PENDING';
    return {
      ...challenge,
      canEdit: isPending,
      canCancel: isPending,
    };
  }

  async deleteMyChallenge(id, userId) {
    const deleted = await this.#challengeRepository.deleteByRequestor(
      id,
      userId,
    );
    if (deleted) return;

    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    if (challenge.requestorId !== userId) {
      throw new ForbiddenException(
        '본인이 신청한 챌린지만 취소할 수 있습니다.',
      );
    }
    throw new ConflictException('승인 전인 챌린지만 취소할 수 있습니다.');
  }

  // async getAdminChallenges(query) {}

  //async getAdminChallengeDetail(id) {}

  //async moderateChallenge(id, adminId, { action, reason }) {}

  //async updateChallenge(id, adminId, data) {}
}
