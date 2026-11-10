import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';
import { CHALLENGE_STATUSES, ERROR_MESSAGE } from '#constants';

const MAX_PAGE = 100;

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
  #db;
  #challengeRepository;
  #moderationLogRepository;
  #participationRepository;
  #submissionRepository;

  constructor({
    db,
    challengeRepository,
    moderationLogRepository,
    participationRepository,
    submissionRepository,
  }) {
    this.#db = db;
    this.#challengeRepository = challengeRepository;
    this.#moderationLogRepository = moderationLogRepository;
    this.#participationRepository = participationRepository;
    this.#submissionRepository = submissionRepository;
  }

  async createChallenge(userId, data) {
    const challenge = await this.#challengeRepository.create({
      ...data,
      requestorId: userId,
    });
    return challenge;
  }

  async getChallenges({
    category,
    documentType,
    progress,
    sort,
    page,
    pageSize,
    keyword,
  }) {
    const filters = { category, documentType, state: progress, keyword };

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
        totalPages: Math.min(Math.ceil(total / pageSize), MAX_PAGE),
      },
    };
  }

  async getChallengeDetail(challengeId, userId) {
    const challenge = await this.#challengeRepository.findById(challengeId);

    if (!challenge || challenge.status !== 'APPROVED') {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    const isClosed = new Date(challenge.deadlineAt) <= new Date();

    const [myParticipationAndSubmission, bestSubmissions] = await Promise.all([
      this.#findMyParticipationAndSubmission(challengeId, userId),
      isClosed ? this.#getBestSubmissions(challengeId) : [],
    ]);

    return { ...challenge, ...myParticipationAndSubmission, bestSubmissions };
  }

  async getMyChallenges(userId, type, { page, pageSize, keyword, status }) {
    const typeFilters = MY_CHALLENGE_FILTERS[type](userId);

    const filters = { ...typeFilters, keyword };
    if (type === 'requested' && status) {
      filters.statuses = [status];
    }

    const [challenges, { total }] = await Promise.all([
      this.#challengeRepository.findMany({ page, pageSize, ...filters }),
      this.#challengeRepository.count(filters),
    ]);

    const items =
      type === 'requested'
        ? challenges
        : await this.#attachMySubmissionIds(challenges, userId);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalCount: total,
        totalPages: Math.min(Math.ceil(total / pageSize), MAX_PAGE),
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
    const hasModeration = ['REJECTED', 'CANCELED'].includes(challenge.status);

    const moderation = hasModeration
      ? await this.#moderationLogRepository.findLatestByChallenge(id)
      : null;

    return {
      ...challenge,
      canEdit: isPending || challenge.status === 'REJECTED',
      canCancel: isPending && !hasActivity,
      moderation: moderation ?? null,
    };
  }

  async updateMyChallenge(id, userId, data) {
    const updated = await this.#challengeRepository.updateByRequestor(
      id,
      userId,
      data,
    );
    if (updated) return updated;

    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    if (challenge.requestorId !== userId) {
      throw new ForbiddenException(
        '본인이 신청한 챌린지만 수정할 수 있습니다.',
      );
    }
    throw new ConflictException(
      '승인 대기 중이거나 거절된 챌린지만 수정할 수 있습니다.',
    );
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
    const filters = this.#buildAdminFilters({ status, keyword });

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
        totalPages: Math.min(Math.ceil(total / pageSize), MAX_PAGE),
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
    const inList = await this.#challengeRepository.isInList(id, filters);

    const [adjacent, moderation] = await Promise.all([
      inList
        ? this.#challengeRepository.findAdjacentIds(challenge, filters, sort)
        : { prevId: null, nextId: null },
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

  // 로그인 + 참여 중이면 참여 id와 제출물 id (미제출이면 null), 아니면 둘 다 null
  async #findMyParticipationAndSubmission(challengeId, userId) {
    const empty = { myParticipation: null, mySubmissionId: null };

    if (!userId) return empty;

    const participation =
      await this.#participationRepository.findWithSubmissionByChallengeIdAndUserId(
        {
          challengeId,
          userId,
        },
      );

    if (!participation) return empty;

    return {
      myParticipation: { id: participation.id },
      mySubmissionId: participation.submission?.id ?? null,
    };
  }

  // 내 챌린지 목록(참여중·완료) : 챌린지마다 내 제출물 id를 붙임 (미제출이면 null)
  async #attachMySubmissionIds(challenges, userId) {
    const participations =
      await this.#participationRepository.findWithSubmissionByChallengeIdsAndUserId(
        {
          challengeIds: challenges.map((challenge) => challenge.id),
          userId,
        },
      );

    const submissionIdByChallengeId = new Map(
      participations.map((participation) => [
        participation.challengeId,
        participation.submission?.id ?? null,
      ]),
    );

    return challenges.map((challenge) => ({
      ...challenge,
      mySubmissionId: submissionIdByChallengeId.get(challenge.id) ?? null,
    }));
  }

  // 최다 추천 번역 : 잠금 없이 채택 여부를 먼저 확인하고, 미처리일 때만 채택 처리
  async #getBestSubmissions(challengeId) {
    const challenge =
      await this.#challengeRepository.findSelectedAt(challengeId);

    if (challenge && !challenge.selectedAt) {
      await this.#selectBestSubmissions(challengeId);
    }

    const selected =
      await this.#submissionRepository.findSelectedByChallengeId(challengeId);

    return selected.map(
      ({ id, content, likes, submittedAt, participation }) => ({
        id,
        content,
        likeCount: likes,
        submittedAt,
        author: participation.user,
      }),
    );
  }

  // 채택 처리 : 잠금 후 다시 확인해서 동시 첫 조회의 중복 채택 방지
  async #selectBestSubmissions(challengeId) {
    await this.#db.transaction(async (tx) => {
      const challenge = await this.#challengeRepository.findSelectedAtForUpdate(
        challengeId,
        { tx },
      );

      if (!challenge || challenge.selectedAt) return;

      const candidates =
        await this.#submissionRepository.findLikeCountsByChallengeId(
          challengeId,
          { tx },
        );
      const maxLikes = Math.max(0, ...candidates.map((s) => s.likes));

      if (maxLikes > 0) {
        const selectedIds = candidates
          .filter((s) => s.likes === maxLikes)
          .map((s) => s.id);

        await this.#submissionRepository.markSelected(selectedIds, { tx });
      }

      await this.#challengeRepository.markSelected(challengeId, { tx });
    });
  }

  #buildAdminFilters({ status, keyword } = {}) {
    return {
      statuses: status?.length ? status : CHALLENGE_STATUSES,
      keyword,
    };
  }
}
