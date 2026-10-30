export class FeedbackRepository {
  #db;
  #fields = ['id', 'submissionId', 'content', 'createdAt', 'updatedAt'];

  constructor({ db }) {
    this.#db = db;
  }
  findAll(submissionId) {
    return this.#db.orm.public.Feedback.where({
      submissionId: Number(submissionId),
    })
      .select(...this.#fields)
      .include('author', (author) => author.select('id', 'nickname', 'grade'))
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
}
