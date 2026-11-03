export class NotificationRepository {
  #db;

  #fields = [
    'id',
    'type',
    'message',
    'challengeId',
    'submissionId',
    'feedbackId',
    'readAt',
    'recipientId',
    'createdAt',
  ];

  constructor({ db }) {
    this.#db = db;
  }

  #orm(tx) {
    return (tx ?? this.#db).orm.public;
  }

  //알림 만들기
  create(data, { tx } = {}) {
    return this.#orm(tx)
      .Notification.select('id', 'type', 'message', 'createdAt')
      .create(data);
  }

  createMany(dataList, { tx } = {}) {
    if (dataList.length === 0) return 0;
    return this.#orm(tx).Notification.createAndCount(dataList);
  }

  findMany({ recipientId, isRead, page, pageSize }) {
    return this.#buildListQuery({ recipientId, isRead })
      .select(...this.#fields)
      .orderBy([(n) => n.createdAt.desc(), (n) => n.id.desc()])
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .all();
  }

  async count({ recipientId, isRead }) {
    const { total } = await this.#buildListQuery({
      recipientId,
      isRead,
    }).aggregate((aggregate) => ({ total: aggregate.count() }));
    return total;
  }

  markAsRead(id, recipientId) {
    return this.#orm()
      .Notification.where({ id, recipientId })
      .where((n) => n.readAt.isNull())
      .select('id', 'readAt')
      .update({ readAt: new Date().toISOString() });
  }

  findByIdAndRecipient(id, recipientId) {
    return this.#orm()
      .Notification.where({ id, recipientId })
      .select('id', 'readAt')
      .first();
  }

  #buildListQuery({ recipientId, isRead }) {
    let query = this.#orm().Notification.where({ recipientId });

    if (isRead === true) {
      query = query.where((n) => n.readAt.isNotNull());
    }

    if (isRead === false) {
      query = query.where((n) => n.readAt.isNull());
    }
    return query;
  }

  markAllAsRead(recipientId) {
    return this.#orm()
      .Notification.where({ recipientId })
      .where((n) => n.readAt.isNull())
      .updateAndCount({ readAt: new Date().toISOString() });
  }
}
