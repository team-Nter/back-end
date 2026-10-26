import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';
import { validate } from '#middlewares';
import { createUserSchema, userIdParamSchema } from './dto/user.dto.js';

export class UserController extends BaseController {
  #userService;

  constructor({ userService }) {
    super();
    this.#userService = userService;
  }

  routes() {
    this.router.get('/', (req, res) => this.getUsers(req, res));
    this.router.get(
      '/:userId',
      validate('params', userIdParamSchema),
      (req, res) => this.getUser(req, res),
    );
    this.router.post('/', validate('body', createUserSchema), (req, res) =>
      this.createUser(req, res),
    );

    return this.router;
  }

  async getUsers(_req, res) {
    const users = await this.#userService.listUsers();
    res.status(HTTP_STATUS.OK).json(users);
  }

  async getUser(req, res) {
    const { userId } = req.params;
    const user = await this.#userService.getUserDetail(userId);
    res.status(HTTP_STATUS.OK).json(user);
  }

  async createUser(req, res) {
    const { email, password, name } = req.body;
    const newUser = await this.#userService.registerUser({
      email,
      password,
      name,
    });
    res.status(HTTP_STATUS.CREATED).json(newUser);
  }
}
