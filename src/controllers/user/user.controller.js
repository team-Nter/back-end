import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';
import { validate } from '#middlewares';
import { createUserSchema, userIdParamSchema } from './dto/user.dto.js';
import {
  challengeIdParamSchema,
  myChallengeListQuerySchema,
} from '../challenge/dto/challenge.dto.js';

export class UserController extends BaseController {
  #userService;
  #challengeService;
  #authz;

  constructor({ userService, challengeService, authz }) {
    super();
    this.#userService = userService;
    this.#challengeService = challengeService;
    this.#authz = authz;
  }

  routes() {
    this.router.get('/', (req, res) => this.getUsers(req, res));
    this.router.get(
      '/challenges',
      this.#authz.requireAuth,
      validate('query', myChallengeListQuerySchema),
      (req, res) => this.getMyChallenges(req, res),
    );
    this.router.get(
      '/challenges/:challengeId',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      (req, res) => this.getMyChallengeDetail(req, res),
    );
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

  async getMyChallenges(req, res) {
    const { type, ...query } = req.query;
    const myChallenges = await this.#challengeService.getMyChallenges(
      req.user.id,
      type,
      query,
    );
    res.status(HTTP_STATUS.OK).json(myChallenges);
  }

  async getMyChallengeDetail(req, res) {
    const myChallengeDetail = await this.#challengeService.getMyChallengeDetail(
      req.params.challengeId,
      req.user.id,
    );
    res.status(HTTP_STATUS.OK).json(myChallengeDetail);
  }

}
