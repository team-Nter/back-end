export class FeedbackRepository {
  #db;
  #fields = ['id', 'submissionId', 'content', 'createdAt', 'updatedAt'];

  constructor({ db }) {
    this.#db = db;
  }

  findById(feedbackId) {
    return this.#db.orm.public.Feedback.where({ id: Number(feedbackId) })
      .select('id', 'authorId')
      .first();
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

  create(submissionId, authorId, content) {
    return this.#db.orm.public.Feedback.select(...this.#fields)
      .include('author', (author) => author.select('id', 'nickname', 'grade'))
      .create({
        submissionId: Number(submissionId),
        authorId,
        content,
      });
  }

  update(id, content) {
    return this.#db.orm.public.Feedback.where({ id: Number(id) })
      .select(...this.#fields)
      .include('author', (author) => author.select('id', 'nickname', 'grade'))
      .update({ content });
  }

  delete(id) {
    return this.#db.orm.public.Feedback.where({ id: Number(id) }).delete();
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
