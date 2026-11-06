import { BaseController } from '../base.controller.js';
import { submissionParamsSchema } from '../submission/dto/submission.dto.js';
import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';

export class SubmissionLikeController extends BaseController {
  #submissionLikeService;
  #authz;

  constructor({ submissionLikeService, authz }) {
    super();
    this.#submissionLikeService = submissionLikeService;
    this.#authz = authz;
  }

  routes() {
    const router = this.createRouter({ mergeParams: true });
    router.put(
      '/',
      this.#authz.requireAuth,
      validate('params', submissionParamsSchema),
      (req, res) => this.createSubmissionLike(req, res),
    );

    router.delete(
      '/',
      this.#authz.requireAuth,
      validate('params', submissionParamsSchema),
      (req, res) => this.deleteSubmissionLike(req, res),
    );

    return router;
  }

  async createSubmissionLike(req, res) {
    const { submissionId } = req.params;
    const userId = req.user.id;
    await this.#submissionLikeService.createSubmissionLike(
      userId,
      submissionId,
    );

    res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async deleteSubmissionLike(req, res) {
    const { submissionId } = req.params;
    const userId = req.user.id;
    await this.#submissionLikeService.deleteSubmissionLike(
      userId,
      submissionId,
    );
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
