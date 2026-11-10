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

  async findUserIdsByChallengeId(challenge, { tx } = {}) {
    const rows = await this.#orm(tx)
      .Participation.where({
        challengeId: Number(challenge),
      })
      .select('userId')
      .all();

    return rows.map((row) => row.userId).filter((userId) => userId !== null);
  }

  // 참여 현황 : 챌린지의 참여자 전체와 제출한 작업물(좋아요 수)
  findAllWithSubmissionByChallengeId(challengeId) {
    return this.#orm()
      .Participation.where({ challengeId: Number(challengeId) })
      .select('id', 'joinedAt')
      .include('user', (user) => user.select('id', 'nickname', 'grade'))
      .include('submission', (submission) =>
        submission
          .select('id', 'submittedAt')
          .include('likes', (likes) => likes.count()),
      )
      .all();
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
      .include('user', (user) => user.select('id', 'nickname', 'grade'))
      .first();
  }

  findWithSubmissionByChallengeIdAndUserId(
    { challengeId, userId },
    { tx } = {},
  ) {
    return this.#orm(tx)
      .Participation.where({
        challengeId: Number(challengeId),
        userId: Number(userId),
      })
      .select(...this.#fields)
      .include('submission', (submission) => submission.select('id'))
      .include('user', (user) => user.select('id', 'nickname', 'grade'))
      .first();
  }

  // 내 챌린지 목록 : 여러 챌린지에 대한 내 참여와 제출물 id를 한 번에 조회
  findWithSubmissionByChallengeIdsAndUserId(
    { challengeIds, userId },
    { tx } = {},
  ) {
    if (challengeIds.length === 0) return [];

    return this.#orm(tx)
      .Participation.where({ userId: Number(userId) })
      .where((participation) =>
        participation.challengeId.in(challengeIds.map(Number)),
      )
      .select('id', 'challengeId')
      .include('submission', (submission) => submission.select('id'))
      .all();
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
