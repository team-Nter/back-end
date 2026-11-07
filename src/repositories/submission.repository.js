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

  async countLikesBySubmissionId(submissionId, { tx } = {}) {
    const db = tx ?? this.#db;
    const { likeCount } = await db.orm.public.SubmissionLike.where({
      submissionId: Number(submissionId),
    }).aggregate((aggregate) => ({ likeCount: aggregate.count() }));

    return likeCount;
  }

  // findById
  findById(id, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Submission.where({ id: Number(id) })
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

  findChallengeIdById(id, { tx } = {}) {
    const db = tx ?? this.#db;
    return db.orm.public.Submission.where({ id: Number(id) })
      .select('challengeId')
      .first();
  }

  findByParticipantId(participationId, { tx } = {}) {
    const db = tx ?? this.#db;
    return db.orm.public.Submission.where({
      participationId: Number(participationId),
    })
      .select('id')
      .first();
  }

  findIdForKeyShare(id, { tx }) {
    return tx.orm.public.Submission.where({ id: Number(id) })
      .select('id')
      .forKeyShare()
      .first();
  }

  findReferenceByIdForUpdate(id, { tx } = {}) {
    if (!tx) {
      throw new Error('잠금 조회에는 트랜잭션이 필요합니다.');
    }

    return tx.orm.public.Submission.where({ id: Number(id) })
      .select('id', 'challengeId')
      .forNoKeyUpdate()
      .first();
  }

  async findByIdForUpdate(id, { tx } = {}) {
    if (!tx) {
      throw new Error('잠금 조회에는 트랜잭션이 필요합니다.');
    }

    const submission = await tx.orm.public.Submission.where({ id: Number(id) })
      .select('id')
      .forNoKeyUpdate()
      .first();

    if (!submission) return null;

    return this.findById(id, { tx });
  }

  // findByChallengeId
  findByChallengeId(challengeId, { offset, limit }) {
    return this.#db.orm.public.Submission.where({
      challengeId: Number(challengeId),
    })
      .select(...this.#fields)
      .orderBy([
        (submission) => submission.likes.count().desc(),
        (submission) => submission.submittedAt.asc(),
        (submission) => submission.id.asc(),
      ])
      .offset(offset)
      .limit(limit)
      .include('likes', (likes) => likes.count())
      .include('feedbacks', (feedbacks) => feedbacks.count())
      .include('participation', (participation) =>
        participation
          .select('id')
          .include('user', (user) => user.select('id', 'nickname', 'grade')),
      )
      .all();
  }

  async countByChallengeId(challengeId) {
    const { totalCount } = await this.#db.orm.public.Submission.where({
      challengeId: Number(challengeId),
    }).aggregate((aggregate) => ({ totalCount: aggregate.count() }));
    return totalCount;
  }

  // create
  create(challengeId, data, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Submission.select(...this.#fields)
      .include('participation', (participation) =>
        participation
          .select('id')
          .include('user', (user) => user.select('id', 'nickname', 'grade')),
      )
      .create({
        challengeId: Number(challengeId),
        participationId: data.participationId,
        title: data.title,
        content: data.content,
        submittedAt: new Date().toISOString(),
      });
  }
  // update

  update(id, data, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Submission.where({ id: Number(id) })
      .select(...this.#fields)
      .update(data);
  }
  //delete

  delete(id, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Submission.where({ id: Number(id) }).delete();
  }

  // 채택 후보 : 챌린지의 작업물별 좋아요 수
  findLikeCountsByChallengeId(challengeId, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Submission.where({
      challengeId: Number(challengeId),
    })
      .select('id')
      .include('likes', (likes) => likes.count())
      .all();
  }

  // 채택 기록
  markSelected(ids, { tx } = {}) {
    const db = tx ?? this.#db;

    return db.orm.public.Submission.where((submission) =>
      submission.id.in(ids),
    ).updateAll({ isSelected: true });
  }

  // 최다 추천 번역 : 채택된 작업물
  findSelectedByChallengeId(challengeId) {
    return this.#db.orm.public.Submission.where({
      challengeId: Number(challengeId),
      isSelected: true,
    })
      .select('id', 'content', 'submittedAt')
      .include('likes', (likes) => likes.count())
      .include('participation', (participation) =>
        participation
          .select('id')
          .include('user', (user) => user.select('id', 'nickname', 'grade')),
      )
      .orderBy([
        (submission) => submission.submittedAt.asc(),
        (submission) => submission.id.asc(),
      ])
      .all();
  }
}
