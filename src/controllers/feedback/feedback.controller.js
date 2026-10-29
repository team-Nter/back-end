import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';

export class FeedbackController extends BaseController {
  #feedbackService;

  constructor({ feedbackService }) {
    super();
    this.#feedbackService = feedbackService;
  }

  routes() {
    const router = this.createRouter({ mergeParams: true });
    router.get('/', (req, res) => this.getFeedbacks(req, res));
  }

  async getFeedbacks(req, res) {
    const { submissionId } = req.params;
    const feedbacks = await this.#feedbackService.getFeedbacks(submissionId);

    res.status(HTTP_STATUS.OK).json(feedbacks);
  }
}
