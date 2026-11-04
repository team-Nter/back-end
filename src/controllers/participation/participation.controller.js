import express from 'express';
import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';
import { validate } from '#middlewares';
import {
  challengeIdParamSchema,
  participationParamsSchema,
} from './dto/participation.dto.js';

export class ParticipationController extends BaseController {
  #participationService;
  #authz;

  constructor({ participationService, authz }) {
    super();
    this.router = express.Router({ mergeParams: true });
    this.#participationService = participationService;
    this.#authz = authz;
  }

  routes() {
    this.router.get(
      '/:userId',
      validate('params', participationParamsSchema),
      (req, res) => this.getParticipation(req, res),
    );
    this.router.post(
      '/',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      (req, res) => this.joinChallenge(req, res),
    );
    this.router.delete(
      '/me',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      (req, res) => this.leaveChallenge(req, res),
    );

    return this.router;
  }

  async getParticipation(req, res) {
    const { challengeId, userId } = req.params;
    const participation = await this.#participationService.getParticipation({
      challengeId,
      userId,
    });
    res.status(HTTP_STATUS.OK).json(participation);
  }

  async joinChallenge(req, res) {
    const { challengeId } = req.params;
    const userId = req.user.id;
    const participation = await this.#participationService.joinChallenge({
      challengeId,
      userId,
    });
    res.status(HTTP_STATUS.CREATED).json(participation);
  }

  async leaveChallenge(req, res) {
    const { challengeId } = req.params;
    const userId = req.user.id;
    await this.#participationService.leaveChallenge({
      challengeId,
      userId,
    });
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
