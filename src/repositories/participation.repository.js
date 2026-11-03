export class ParticipationRepository {
  #db;

  #fields = ['id', 'challengeId', 'userId', 'joinedAt'];

  constructor({ db }) {
    this.#db = db;
  }

  #orm(tx) {
    return (tx ?? this.#db).orm.public;
  }

  async countByChallengeId(challengeId, { tx } = {}) {
    const { totalCount } = await this.#orm(tx)
      .Participation.where({
        challengeId: Number(challengeId),
      })
      .aggregate((aggregate) => ({ totalCount: aggregate.count() }));

    return totalCount;
  }

  create({ challengeId, userId }, { tx } = {}) {
    return this.#orm(tx)
      .Participation.select(...this.#fields)
      .create({
        challengeId: Number(challengeId),
        userId: Number(userId),
      });
  }

  findByChallengeIdAndUserId({ challengeId, userId }, { tx } = {}) {
    return this.#orm(tx)
      .Participation.where({
        challengeId: Number(challengeId),
        userId: Number(userId),
      })
      .select(...this.#fields)
      .first();
  }

  // 행 잠금 위해 작성
  findByChallengeIdAndUserIdForUpdate({ challengeId, userId }, { tx } = {}) {
    if (!tx) {
      throw new Error('잠금 조회에는 트랜잭션이 필요합니다.');
    }

    return this.#orm(tx)
      .Participation.where({
        challengeId: Number(challengeId),
        userId: Number(userId),
      })
      .select(...this.#fields)
      .forNoKeyUpdate()
      .first();
  }

  deleteByChallengeIdAndUserId({ challengeId, userId }) {
    return this.#orm()
      .Participation.where({
        challengeId: Number(challengeId),
        userId: Number(userId),
      })
      .delete();
  }
}
