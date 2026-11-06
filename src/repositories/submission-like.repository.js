export class SubmissionLikeRepository {
  #db;

  constructor({ db }) {
    this.#db = db;
  }

  create(userId, submissionId, { tx } = {}) {
    const db = tx ?? this.#db;
    return db.orm.public.SubmissionLike.createAll(
      [
        {
          userId: Number(userId),
          submissionId: Number(submissionId),
        },
      ],
      {
        onConflict: 'skip',
        conflictOn: ['userId', 'submissionId'],
      },
    );
  }

  delete(userId, submissionId, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.SubmissionLike.where({
      userId: Number(userId),
      submissionId: Number(submissionId),
    }).delete();
  }
}
