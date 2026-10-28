export class SubmissionRepository {
  #db;
  #fields = [
    'id',
    'participationId',
    'challengeId',
    'title',
    'content',
    'isSelected',
    'createdAt',
    'updatedAt',
    'submittedAt',
    'likes',
    'feedbacks',
    'notifications',
  ];

  constructor({ db }) {
    this.#db = db;
  }

  // findById
  findById(id) {
    return this.#db.orm.public.Submission.where({ id: Number(id) })
      .select(...this.#fields)
      .first();
  }

  // findByChallengeId

  // create

  // update
  //delete
}
