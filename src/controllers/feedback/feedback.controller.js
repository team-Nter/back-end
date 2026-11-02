import { HTTP_STATUS } from '#constants';
import { UnauthorizedException } from '#exceptions';
import { validate } from '#middlewares';
import { BaseController } from '../base.controller.js';
import { submissionParamsSchema } from '../submission/dto/submission.dto.js';
import {
  createFeedbackSchema,
  feedbackParamsSchema,
} from './dto/feedback.dto.js';

export class FeedbackController extends BaseController {
  #feedbackService;
  #authz;

  constructor({ feedbackService, authz }) {
    super();
    this.#feedbackService = feedbackService;
    this.#authz = authz;
  }

  routes() {
    this.router.patch(
      '/:feedbackId',
      this.#authz.requireAuth,
      validate('params', feedbackParamsSchema),
      validate('body', createFeedbackSchema),
      (req, res) => this.updateFeedback(req, res),
    );
    this.router.delete(
      '/:feedbackId',
      this.#authz.requireAuth,
      validate('params', feedbackParamsSchema),
      (req, res) => this.deleteFeedback(req, res),
    );
    return this.router;
  }

  submissionRoutes() {
    const router = this.createRouter({ mergeParams: true });
    router.get('/', validate('params', submissionParamsSchema), (req, res) =>
      this.getFeedbacks(req, res),
    );
    router.post(
      '/',
      this.#authz.requireAuth,
      validate('params', submissionParamsSchema),
      validate('body', createFeedbackSchema),
      (req, res) => this.createFeedback(req, res),
    );
    return router;
  }

  async getFeedbacks(req, res) {
    const { submissionId } = req.params;
    const { page, pageSize } = req.query;

    const feedbacks = await this.#feedbackService.getFeedbacks(
      submissionId,
      page,
      pageSize,
    );

    res.status(HTTP_STATUS.OK).json(feedbacks);
  }

  async createFeedback(req, res) {
    const { submissionId } = req.params;
    const { content } = req.body;

    const feedback = await this.#feedbackService.createFeedback(
      submissionId,
      req.user.id,
      content,
    );

    return res.status(HTTP_STATUS.CREATED).json(feedback);
  }

  async updateFeedback(req, res) {
    const { feedbackId } = req.params;
    const { content } = req.body;

    const feedback = await this.#feedbackService.updateFeedback(
      feedbackId,
      req.user.id,
      content,
    );

    return res.status(HTTP_STATUS.OK).json(feedback);
  }

  async deleteFeedback(req, res) {
    const { feedbackId } = req.params;
    await this.#feedbackService.deleteFeedback(feedbackId, req.user.id);
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
