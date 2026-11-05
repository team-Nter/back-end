export class submissionDraftRepository {
  #db;
  #fields = ['id', 'title', 'content', 'createdAt', 'updatedAt'];

  constructor({ db }) {
    this.#db = db;
  }

  findByParticipationId(participationId, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.SubmissionDraft.where({
      participationId: Number(participationId),
    })
      .select(...this.#fields)
      .first();
  }

  upsert(participationId, { title, content }, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.SubmissionDraft.select(...this.#fields).upsert({
      conflictOn: { participationId: Number(participationId) },
      create: {
        participationId: Number(participationId),
        title,
        content,
      },
      update: {
        title,
        content,
      },
    });
  }

  delete(participantionId, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.SubmissionDraft.where({
      participantionId: Number(participantionId),
    }).delete();
  }
}
