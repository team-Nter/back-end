import { HTTP_STATUS } from '#constants';
import { UnauthorizedException } from '#exceptions';
import { validate } from '#middlewares';
import { BaseController } from '../base.controller.js';
import {
  createFeedbackSchema,
  feedbackParamsSchema,
} from './dto/feedback.dto.js';

export class FeedbackController extends BaseController {
  #feedbackService;

  constructor({ feedbackService }) {
    super();
    this.#feedbackService = feedbackService;
  }

  routes() {
    this.router.patch(
      '/:feedbackId',
      validate('body', createFeedbackSchema),
      (req, res) => this.updateFeedback(req, res),
    );
    this.router.delete('/:feedbackId', (req, res) =>
      this.deleteFeedback(req, res),
    );
    return this.router;
  }

  submissionRoutes() {
    const router = this.createRouter({ mergeParams: true });
    router.get('/', (req, res) => this.getFeedbacks(req, res));
    router.post('/', validate('body', createFeedbackSchema), (req, res) =>
      this.createFeedback(req, res),
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
    // 로그인 한 것 정보 가져오기
    if (!req.user) {
      throw new UnauthorizedException('로그인이 필요합니다');
    }
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
    if (!req.user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
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
    if (!req.user) {
      throw new UnauthorizedException('로그인이 필요합니다');
    }
    const { feedbackId } = req.params;
    await this.#feedbackService.deleteFeedback(feedbackId, req.user.id);
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
