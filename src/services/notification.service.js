import { NotFoundException } from '#exceptions';

export class NotificationService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  async getMyNotifications(userId, { page, pageSize, isRead }) {
    const [items, totalCount, unreadCount] = await Promise.all([
      this.#notificationRepository.findMany({
        recipientId: userId,
        isRead,
        page,
        pageSize,
      }),
      this.#notificationRepository.count({ recipientId: userId, isRead }),
      this.#notificationRepository.count({
        recipientId: userId,
        isRead: false,
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      unreadCount,
    };
  }

  async readNotification(userId, notificationId) {
    const updated = await this.#notificationRepository.markAsRead(
      notificationId,
      userId,
    );
    if (updated) return;

    const notification =
      await this.#notificationRepository.findByIdAndRecipient(
        notificationId,
        userId,
      );
    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }
  }

  async readAllNotifications(userId) {
    await this.#notificationRepository.markAllAsRead(userId);
  }
}
