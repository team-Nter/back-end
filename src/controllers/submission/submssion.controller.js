import { HTTP_STATUS } from '#constants';
import { BaseController } from '../base.controller.js';

export class SubmissionController extends BaseController {
  #submissionService;

  constructor({ submissionService }) {
    super();
    this.#submissionService = submissionService;
  }

  routes() {
    this.router.get('/:submissionId', (req, res) =>
      this.getSubmission(req, res),
    );

    return this.router;
  }

  challengeRoutes() {
    const router = this.createRouter({ mergeParams: true });

    router.get('/', (req, res) => this.getSubmissions(req, res));

    return router;
  }

  async getSubmission(req, res) {
    const { submissionId } = req.params;

    const submission =
      await this.#submissionService.getSubmission(submissionId);
    res.status(HTTP_STATUS.OK).json(submission);
  }

  async getSubmissions(req, res) {
    const { challengeId } = req.params;
    const { page, pageSize } = req.query;
    const submissions = await this.#submissionService.getSubmissions(
      challengeId,
      page,
      pageSize,
    );
    res.status(HTTP_STATUS.OK).json(submissions);
  }
}
