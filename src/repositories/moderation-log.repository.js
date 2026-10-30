export class ModerationLogRepository {
  #db;

  constructor({ db }) {
    this.#db = db;
  }

  #orm(tx) {
    return (tx ?? this.#db).orm.public;
  }

  // 챌린지의 가장 최근 기록처리 (거절/삭제 사유 표시용)
  findLatestByChallenge(challengeId) {
    return this.#orm()
      .ModerationLog.where({ challengeId })
      .orderBy([(log) => log.createdAt.desc(), (log) => log.id.desc()])
      .select('action', 'reason', 'createdAt')
      .first();
  }
}
