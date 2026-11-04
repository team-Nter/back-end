export class FeedbackRepository {
  #db;
  #fields = ['id', 'submissionId', 'content', 'createdAt', 'updatedAt'];

  constructor({ db }) {
    this.#db = db;
  }

  findById(feedbackId, { tx } = {}) {
    const db = tx ?? this.#db;
    return db.orm.public.Feedback.where({ id: Number(feedbackId) })
      .select('id', 'authorId', 'submissionId')
      .first();
  }

  async findByIdForUpdate(feedbackId, { tx } = {}) {
    if (!tx) {
      throw new Error('잠금 조회에는 트랜잭션이 필요합니다.');
    }

    const feedback = await tx.orm.public.Feedback.where({
      id: Number(feedbackId),
    })
      .select('id', 'authorId', 'submissionId')
      .forNoKeyUpdate()
      .first();

    if (!feedback) return null;

    return this.findById(feedbackId, { tx });
  }

  findAll(submissionId, { offset, limit }) {
    return this.#db.orm.public.Feedback.where({
      submissionId: Number(submissionId),
    })
      .select(...this.#fields)
      .orderBy([
        (feedback) => feedback.createdAt.desc(),
        (feedback) => feedback.id.desc(),
      ])
      .include('author', (author) => author.select('id', 'nickname', 'grade'))
      .offset(offset)
      .limit(limit)
      .all();
  }

  create(submissionId, authorId, content, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Feedback.select(...this.#fields)
      .include('author', (author) => author.select('id', 'nickname', 'grade'))
      .create({
        submissionId: Number(submissionId),
        authorId,
        content,
      });
  }

  update(id, content, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Feedback.where({ id: Number(id) })
      .select(...this.#fields)
      .include('author', (author) => author.select('id', 'nickname', 'grade'))
      .update({ content });
  }

  delete(id, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Feedback.where({ id: Number(id) }).delete();
  }

  async countFeedbacks(submissionId) {
    const { totalCount } = await this.#db.orm.public.Feedback.where({
      submissionId: Number(submissionId),
    }).aggregate((aggregate) => ({
      totalCount: aggregate.count(),
    }));

    return totalCount;
  }
}
