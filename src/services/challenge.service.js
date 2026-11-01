import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';
import { CHALLENGE_STATUSES } from '#constants';

const MY_CHALLENGE_FILTERS = {
  requested: (userId) => ({
    requestorId: userId,
    statuses: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'],
  }),
  participating: (userId) => ({
    participantUserId: userId,
    statuses: ['APPROVED'],
    state: 'open',
  }),
  completed: (userId) => ({
    participantUserId: userId,
    statuses: ['APPROVED'],
    state: 'closed',
  }),
};

export class ChallengeService {
  #challengeRepository;
  #moderationLogRepository;

  constructor({ challengeRepository, moderationLogRepository }) {
    this.#challengeRepository = challengeRepository;
    this.#moderationLogRepository = moderationLogRepository;
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
    const hasActivity =
      challenge.participations > 0 || challenge.submissions > 0;

    return {
      ...challenge,
      canEdit: isPending,
      canCancel: isPending && !hasActivity,
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
    if (challenge.status !== 'PENDING') {
      throw new ConflictException('승인 전인 챌린지만 취소할 수 있습니다.');
    }
    throw new ConflictException(
      '참여 이력이 있는 챌린지는 취소할 수 없습니다.',
    );
  }

  async getAdminChallenges({ status, sort, page, pageSize, keyword }) {
    const filters = {
      statuses: status ? [status] : CHALLENGE_STATUSES,
      keyword,
    };

    const [items, { total }] = await Promise.all([
      this.#challengeRepository.findMany({ page, pageSize, sort, ...filters }),
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

  async getAdminChallengeDetail(id, { status, keyword, sort } = {}) {
    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    const filters = this.#buildAdminFilters({ status, keyword });
    const hasModeration = ['REJECTED', 'CANCELED'].includes(challenge.status);

    const [adjacent, moderation] = await Promise.all([
      this.#challengeRepository.findAdjacentIds(challenge, filters, sort),
      hasModeration
        ? this.#moderationLogRepository.findLatestByChallenge(id)
        : null,
    ]);

    return {
      ...challenge,
      ...adjacent,
      moderation: moderation ?? null,
    };
  }

  //async moderateChallenge(id, adminId, { action, reason }) {}

  //async updateChallenge(id, adminId, data) {}

  #buildAdminFilters({ status, keyword } = {}) {
    return {
      statuses: status ? [status] : CHALLENGE_STATUSES,
      keyword,
    };
  }
}
