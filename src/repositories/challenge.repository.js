export class ChallengeRepository {
  #db;
  // 사용할 필드 목록을 재사용
  #fields = [
    'id',
    'requestorId',
    'title',
    'sourceUrl',
    'description',
    'category',
    'documentType',
    'deadlineAt',
    'maxParticipants',
    'status',
    'createdAt',
  ];

  constructor({ db }) {
    this.#db = db;
  }

  #orm(tx) {
    return (tx ?? this.#db).orm.public;
  }

  // 챌린지 상세
  findById(id) {
    return this.#orm()
      .Challenge.where({ id })
      .select(...this.#fields)
      .include('requestor', (requestor) => requestor.select('id', 'nickname'))
      .include('participations', (participations) => participations.count())
      .include('submissions', (submissions) => submissions.count())
      .first();
  }

  //챌린지 목록(공개/관리자/내가 신청한/내가 참여한)
  findMany({ page = 1, pageSize = 10, ...filters } = {}) {
    return this.#buildListQuery(filters)
      .select(...this.#fields)
      .include('requestor', (requestor) => requestor.select('id', 'nickname'))
      .include('participations', (participations) => participations.count())
      .orderBy((challenge) => challenge.createdAt.desc())
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .all();
  }

  // 목록 전체 개수 (페이지네이션용)
  count(filters) {
    return this.#buildListQuery(filters).aggregate((agg) => ({
      total: agg.count(),
    }));
  }

  //챌린지 신청
  create(data) {
    return this.#orm()
      .Challenge.select(...this.#fields)
      .create(data);
  }

  // 챌린지 수정 (ADMIN)
  update(id, data, { tx } = {}) {
    return this.#orm(tx)
      .Challenge.where({ id })
      .select(...this.#fields)
      .update(data);
  }

  //본인 + 승인 대기일 때만 수정
  updateByRequestor(id, requestorId, data) {
    return this.#orm()
      .Challenge.where({
        id,
        requestorId,
        status: 'PENDING',
      })
      .select(...this.#fields)
      .update(data);
  }

  //(현재 상태가 from일 때만 to로 변경)
  changeStatus(id, from, to, { tx } = {}) {
    return this.#orm(tx)
      .Challenge.where({ id, status: from })
      .select(...this.#fields)
      .update({ status: to });
  }

  //신청 취소(승인 대기 일 때만)
  cancel(id, requestorId) {
    return this.#orm()
      .Challenge.where({
        id,
        requestorId,
        status: 'PENDING',
      })
      .select(...this.#fields)
      .update({ status: 'CANCELED' });
  }

  //삭제 (참여 이력이 없을 때만 실제 삭제)
  deleteIfNoActivity(id, { tx } = {}) {
    return this.#orm(tx)
      .Challenge.where({ id })
      .where((challenge) => challenge.participations.none())
      .where((challenge) => challenge.submissions.none())
      .delete();
  }

  #buildListQuery({
    statuses = ['APPROVED'],
    category,
    documentType,
    state,
    keyword,
    requestorId,
    participantUserId,
  } = {}) {
    let query = this.#orm().Challenge.where((challenge) =>
      challenge.status.in(statuses),
    );

    if (requestorId) {
      query = query.where({ requestorId });
    }

    if (participantUserId) {
      query = query.where((challenge) =>
        challenge.participations.some({ userId: participantUserId }),
      );
    }
    if (category?.length) {
      query = query.where((challenge) => challenge.category.in(category));
    }

    if (documentType) {
      query = query.where({ documentType });
    }

    const now = new Date().toISOString();
    if (state === 'progress') {
      query = query.where((challenge) => challenge.deadlineAt.gt(now));
    } else if (state === 'closed') {
      query = query.where((challenge) => challenge.deadlineAt.lte(now));
    }
    if (keyword) {
      query = query.where((challenge) => challenge.title.ilike(`%${keyword}%`));
    }

    return query;
  }
}
