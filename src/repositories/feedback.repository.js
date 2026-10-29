export class FeedbackRepository {
  #db;
  #fields = ['id', 'submissionId', 'content', 'createdAt', 'updatedAt'];

  findAll(submissionId) {
    return this.#db.orm.public.Submission.where({
      submissionId: Number(submissionId),
    })
      .select(...this.#fields)
      .include('author', (author) => author.select('id', 'nickname', 'grade'))
      .all();
  }
}
