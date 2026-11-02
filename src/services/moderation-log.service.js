import { ConflictException, NotFoundException } from '#exceptions';

const MODERATION_RULES = {
  APPROVE: { from: 'PENDING', to: 'APPROVED' },
  REJECT: { from: 'PENDING', to: 'REJECTED' },
  CANCEL: { from: 'APPROVED', to: 'CANCELED' },
};

export class ModerationLogService {
  #db;
  #challengeRepository;
  #moderationLogRepository;

  constructor({ db, challengeRepository, moderationLogRepository }) {
    this.#db = db;
    this.#challengeRepository = challengeRepository;
    this.#moderationLogRepository = moderationLogRepository;
  }

  async moderateChallenge(challengeId, adminId, { action, reason }) {
    const { from, to } = MODERATION_RULES[action];

    return this.#db.transaction(async (tx) => {
      const updated = await this.#challengeRepository.changeStatus(
        challengeId,
        from,
        to,
        { tx },
      );

      if (!updated) {
        const challenge = await this.#challengeRepository.findById(challengeId);
        if (!challenge) {
          throw new NotFoundException('챌린지를 찾을 수 없습니다.');
        }
        throw new ConflictException(
          '현재 상태에서는 처리할 수 없는 요청입니다.',
        );
      }

      if (action === 'APPROVE' && new Date(updated.deadlineAt) <= new Date()) {
        throw new ConflictException('마감된 챌린지는 승인할 수 없습니다.');
      }

      const moderation = await this.#moderationLogRepository.create(
        { challengeId, adminId, action, reason: reason ?? null },
        { tx },
      );

      // TODO: 승인·거절 알림 타입 추가 후 NotificationRepository.create(..., { tx })
      return {
        challengeId,
        status: updated.status,
        moderation,
        updatedAt: updated.updatedAt,
      };
    });
  }
}
