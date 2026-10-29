import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';
import { validate } from '#middlewares';
import {
  challengeIdParamSchema,
  createChallengeSchema,
  myChallengeListQuerySchema,
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

    this.router.get(
      '/me',
      this.#authz.requireAuth,
      validate('query', myChallengeListQuerySchema),
      (req, res) => this.getMyChallenges(req, res),
    );

    this.router.get(
      '/me/:challengeId',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      (req, res) => this.getMyChallengeDetail(req, res),
    );

    this.router.delete(
      '/me/:challengeId',
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

  async deleteMyChallenge(req, res) {
    await this.#challengeService.deleteMyChallenge(
      req.params.challengeId,
      req.user.id,
    );
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  
}
