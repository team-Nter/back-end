import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { BaseController } from '../base.controller.js';
import { challengeIdParamSchema } from '../challenge/dto/challenge.dto.js';
import { moderateChallengeSchema } from './dto/moderation-log.dto.js';

export class ModerationLogController extends BaseController {
  #moderationLogService;
  #authz;

  constructor({ moderationLogService, authz }) {
    super();
    this.#moderationLogService = moderationLogService;
    this.#authz = authz;
  }

  routes() {
    const router = this.createRouter({ mergeParams: true });

    router.post(
      '/',
      this.#authz.requireAuth,
      this.#authz.requireAdmin,
      validate('params', challengeIdParamSchema),
      validate('body', moderateChallengeSchema),
      (req, res) => this.moderateChallenge(req, res),
    );

    return router;
  }

  async moderateChallenge(req, res) {
    const result = await this.#moderationLogService.moderateChallenge(
      req.params.challengeId,
      req.user.id,
      req.body,
    );
    res.status(HTTP_STATUS.OK).json(result);
  }
}
