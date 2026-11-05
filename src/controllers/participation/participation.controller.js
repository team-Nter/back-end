import express from 'express';
import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';
import { validate } from '#middlewares';
import {
  challengeIdParamSchema,
  participantListQuerySchema,
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
      '/',
      validate('params', challengeIdParamSchema),
      validate('query', participantListQuerySchema),
      (req, res) => this.getParticipants(req, res),
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

  async getParticipants(req, res) {
    const { challengeId } = req.params;
    const { page, pageSize } = req.query;
    const participants = await this.#participationService.getParticipants({
      challengeId,
      page,
      pageSize,
    });

    res.status(HTTP_STATUS.OK).json(participants);
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
