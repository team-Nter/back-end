export class UserRepository {
  #db;
  // 인증 및 내부 처리용 필드
  #userFields = [
    'id',
    'email',
    'nickname',
    'role',
    'grade',
    'provider',
    'createdAt',
  ];

  // 공개 사용자 조회용 필드
  #publicFields = ['id', 'nickname', 'grade', 'createdAt'];

  constructor({ db }) {
    this.#db = db;
  }

  findById(id) {
    return this.#db.orm.public.User.where({ id: Number(id) })
      .select(...this.#publicFields)
      .first();
  }

  findByIdWithAuthFields(id) {
    return this.#db.orm.public.User.where({ id: Number(id) })
      .select(...this.#userFields)
      .first();
  }

  findByEmail(email, { includePassword = false } = {}) {
    const fields = includePassword
      ? [...this.#userFields, 'passwordHash']
      : this.#userFields;

    return this.#db.orm.public.User.where({ email })
      .select(...fields)
      .first();
  }

  create(data) {
    return this.#db.orm.public.User.select(...this.#userFields).create(data);
  }
}
