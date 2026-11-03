export class ParticipationRepository {
  #db;

  #fields = ['id', 'challengeId', 'userId', 'joinedAt'];

  constructor({ db }) {
    this.#db = db;
  }

  async countByChallengeId(challengeId) {
    const { totalCount } = await this.#db.orm.public.Participation.where({
      challengeId: Number(challengeId),
    }).aggregate((aggregate) => ({ totalCount: aggregate.count() }));

    return totalCount;
  }

  async findUserIdsByChallengeId(challenge, { tx } = {}) {
    const rows = await (tx ?? this.#db).orm.public.Participation.where({
      challengeId: Number(challenge),
    })
      .select('userId')
      .all();

    return rows.map((row) => row.userId).filter((userId) => userId !== null);
  }

  create({ challengeId, userId }) {
    return this.#db.orm.public.Participation.select(...this.#fields).create({
      challengeId: Number(challengeId),
      userId: Number(userId),
    });
  }

  findByChallengeIdAndUserId({ challengeId, userId }) {
    return this.#db.orm.public.Participation.where({
      challengeId: Number(challengeId),
      userId: Number(userId),
    })
      .select(...this.#fields)
      .first();
  }

  deleteByChallengeIdAndUserId({ challengeId, userId }) {
    return this.#db.orm.public.Participation.where({
      challengeId: Number(challengeId),
      userId: Number(userId),
    }).delete();
  }
}
