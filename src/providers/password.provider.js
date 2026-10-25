import bcrypt from 'bcrypt';

export class PasswordProvider {
  #saltRounds;

  constructor() {
    this.#saltRounds = 10;
  }

  async hash(password) {
    return await bcrypt.hash(password, this.#saltRounds);
  }

  async compare(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
