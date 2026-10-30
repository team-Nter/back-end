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
