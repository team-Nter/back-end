import { ConflictException, NotFoundException } from '#exceptions';

const MODERATION_RULES = {
  APPROVE: {
    from: 'PENDING',
    to: 'APPROVED',
    notificationType: 'CHALLENGE_APPROVED',
    message: (title) => `'${title}' 챌린지 신청이 승인되었습니다.`,
  },
  REJECT: {
    from: 'PENDING',
    to: 'REJECTED',
    notificationType: 'CHALLENGE_REJECTED',
    message: (title) => `'${title}' 챌린지 신청이 거절되었습니다.`,
  },

  CANCEL: {
    from: 'APPROVED',
    to: 'CANCELED',
    notificationType: 'CHALLENGE_CANCELED',
    message: (title) => `'${title}' 챌린지가 취소되었습니다.`,
    participantMessage: (title) =>
      `참여중인 '${title}' 챌린지가 취소되었습니다.`,
  },
};

export class ModerationLogService {
  #db;
  #challengeRepository;
  #moderationLogRepository;
  #notificationRepository;
  #participationRepository;

  constructor({
    db,
    challengeRepository,
    moderationLogRepository,
    notificationRepository,
    participationRepository,
  }) {
    this.#db = db;
    this.#challengeRepository = challengeRepository;
    this.#moderationLogRepository = moderationLogRepository;
    this.#notificationRepository = notificationRepository;
    this.#participationRepository = participationRepository;
  }

  async moderateChallenge(challengeId, adminId, { action, reason }) {
    const { from, to, notificationType, message, participantMessage } =
      MODERATION_RULES[action];
    const messages = new Map();

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

      if (updated.requestorId) {
        messages.set(updated.requestorId, message(updated.title));
      }

      if (action === 'CANCEL') {
        const participantIds =
          await this.#participationRepository.findUserIdsByChallengeId(
            challengeId,
            { tx },
          );
        participantIds.forEach((userId) => {
          if (!messages.has(userId)) {
            messages.set(userId, participantMessage(updated.title));
          }
        });
      }

      await this.#notificationRepository.createMany(
        [...messages].map(([recipientId, text]) => ({
          recipientId,
          type: notificationType,
          message: text,
          challengeId,
        })),
        { tx },
      );

      return {
        challengeId,
        status: updated.status,
        moderation,
        updatedAt: updated.updatedAt,
      };
    });
  }
}
