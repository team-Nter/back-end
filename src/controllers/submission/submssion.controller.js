import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { BaseController } from '../base.controller.js';
import { submissionSchema } from './dto/submission.dto.js';

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
    router.post('/', validate('body', submissionSchema), (req, res) =>
      this.createSubmission(req, res),
    );
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

  async createSubmission(req, res) {
    const { challengeId } = req.params;
    const { participationId, title, content } = req.body;
    const submission = await this.#submissionService.createSubmission(
      challengeId,
      {
        participationId,
        title,
        content,
      },
    );
    res.status(HTTP_STATUS.CREATED).json(submission);
  }
}
