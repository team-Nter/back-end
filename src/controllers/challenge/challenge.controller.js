import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';
import { validate } from '#middlewares';
import {
  challengeIdParamSchema,
  createChallengeSchema,
} from './dto/challenge.dto.js';

export class ChallengeController extends BaseController {
  #challengeService;
  #authz;

  constructor({ challengeService, authz }) {
    super();
    this.#challengeService = challengeService;
    this.#authz = authz;
  }

  routes() {
    this.router.post(
      '/',
      this.#authz.requireAuth,
      validate('body', createChallengeSchema),
      (req, res) => this.createChallenge(req, res),
    );

    this.router.delete(
      '/:challengeId',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      (req, res) => this.deleteMyChallenge(req, res),
    );

    return this.router;
  }

  async createChallenge(req, res) {
    const newChallenge = await this.#challengeService.createChallenge(
      req.user.id,
      req.body,
    );
    res.status(HTTP_STATUS.CREATED).json(newChallenge);
  }

  async deleteMyChallenge(req, res) {
    await this.#challengeService.deleteMyChallenge(
      req.params.challengeId,
      req.user.id,
    );
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
