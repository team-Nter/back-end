import { ERROR_MESSAGE } from '#constants';
import { NotFoundException } from '#exceptions';

export class UserService {
  #userRepository;
  #passwordProvider;

  constructor({ userRepository, passwordProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
  }

  async getUserDetail(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    return user;
  }

  async registerUser({ email, password, name }) {
    const hashedPassword = await this.#passwordProvider.hash(password);
    return await this.#userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
  }

  async listUsers() {}
}
