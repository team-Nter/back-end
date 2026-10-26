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

  findById(id) {
    return this.#db.orm.public.Challenge.where({ id: Number(id) })
      .select(...this.#fields)
      .include('participations', (p) => p.where({ status: 'ACTIVE' }).count())
      .first();
  } // 챌린지 상세

  findMany({ page = 1, pageSize = 10, ...filters } = {}) {
    return this.#buildListQuery(filters)
      .select(...this.#fields)
      .include('participations', (p) => p.where({ status: 'ACTIVE' }).count())
      .orderBy((c) => c.createdAt.desc())
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .all();
  } //챌린지 목록

  count(filters) {
    return this.#buildListQuery(filters).aggregate((agg) => ({
      total: agg.count(),
    }));
  } // filter된 게시물 가져오기

  create(data) {
    return this.#db.orm.public.Challenge.select(...this.#fields).create(data);
  } //챌린지 생성

  update(id, data) {
    return this.#db.orm.public.Challenge.where({
      id: Number(id),
    })
      .select(...this.#fields)
      .update(data);
  } // 챌린지 수정 (ADMIN)

  updateByRequestor(id, requestorId, data) {
    return this.#db.orm.public.Challenge.where({
      id,
      requestorId,
      status: 'PENDING',
    })
      .select(...this.#fields)
      .update(data);
  } //본인 + 승인 대기일 때만 수정

  cancel(id, requestorId) {
    return this.#db.orm.public.Challenge.where({
      id,
      requestorId,
      status: 'PENDING',
    })
      .select(...this.#fields)
      .update({ status: 'CANCELED' });
  }

  softDelete(id) {
    return this.#db.orm.public.Challenge.where({ id })
      .select(...this.#fields)
      .update({ status: 'DELETED' });
  }

  #buildListQuery({ category, documentType, state, keyword } = {}) {
    let query = this.#db.orm.public.Challenge.where({ status: 'APPROVED' });

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
