export class FeedbackRepository {
  #db;
  #fields = ['id', 'submissionId', 'content', 'createdAt', 'updatedAt'];

  constructor({ db }) {
    this.#db = db;
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

  async countFeedbacks(submissionId) {
    const { totalCount } = await this.#db.orm.public.Feedback.where({
      submissionId: Number(submissionId),
    }).aggregate((aggregate) => ({
      totalCount: aggregate.count(),
    }));

    return totalCount;
  }
}
