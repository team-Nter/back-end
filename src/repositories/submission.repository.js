export class SubmissionRepository {
  #db;
  #fields = [
    'id',
    'challengeId',
    'title',
    'content',
    'isSelected',
    'createdAt',
    'updatedAt',
    'submittedAt',
  ];

  constructor({ db }) {
    this.#db = db;
  }

  // findById
  findById(id) {
    return this.#db.orm.public.Submission.where({ id: Number(id) })
      .select(...this.#fields)
      .include('likes', (likes) => likes.count())
      .include('feedbacks', (feedbacks) => feedbacks.count())
      .include('participation', (participation) =>
        participation
          .select('id')
          .include('user', (user) => user.select('id', 'nickname', 'grade')),
      )
      .first();
  }

  // findByChallengeId
  findByChallengeId(challengeId) {
    return this.#db.orm.public.Submission.where({
      challengeId: Number(challengeId),
    })
      .select(...this.#fields)
      .include('likes', (likes) => likes.count())
      .include('feedbacks', (feedbacks) => feedbacks.count())
      .include('participation', (participation) =>
        participation
          .select('id')
          .include('user', (user) => user.select('id', 'nickname', 'grade')),
      )
      .all();
  }

  // create

  // update
  //delete
}
