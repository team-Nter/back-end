export class UserRepository {
  #db;
  // 사용할 필드 목록을 재사용
  #fields = ['id', 'email'];

  constructor({ db }) {
    this.#db = db;
  }

  findById(id) {
    return this.#db.orm.public.User.where({ id: Number(id) })
      .select(...this.#fields)
      .first();
  }

  findByEmail(email, { includePassword = false } = {}) {
    const fields = includePassword
      ? [...this.#fields, 'passwordHash']
      : this.#fields;

    return this.#db.orm.public.User.where({ email })
      .select(...fields)
      .first();
  }

  create(data) {
    return this.#db.orm.public.User.select(...this.#fields).create(data);
  }
}
