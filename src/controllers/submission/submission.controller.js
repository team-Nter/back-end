import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { BaseController } from '../base.controller.js';
import { feedbackParamsSchema } from '../feedback/dto/feedback.dto.js';
import {
  submissionSchema,
  updateSubmissionSchema,
} from './dto/submission.dto.js';

export class SubmissionController extends BaseController {
  #submissionService;
  #authz;

  constructor({ submissionService, authz }) {
    super();
    this.#submissionService = submissionService;
    this.#authz = authz;
  }

  routes() {
    this.router.get('/:submissionId', (req, res) =>
      this.getSubmission(req, res),
    );
    this.router.patch(
      '/:submissionId',
      this.#authz.requireAuth,
      validate('body', updateSubmissionSchema),
      (req, res) => this.updateSubmission(req, res),
    );
    this.router.delete('/:submissionId', this.#authz.requireAuth, (req, res) =>
      this.deleteSubmission(req, res),
    );

    return this.router;
  }

  challengeRoutes() {
    const router = this.createRouter({ mergeParams: true });

    router.get('/', (req, res) => this.getSubmissions(req, res));
    router.post(
      '/',
      this.#authz.requireAuth,
      validate('body', submissionSchema),
      (req, res) => this.createSubmission(req, res),
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
    // 참여자 확인 여부는 participation 쪽 완성 이후 작성 예정

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

  async updateSubmission(req, res) {
    const { submissionId } = req.params;
    const { title, content } = req.body;
    const updateSubmission = await this.#submissionService.updateSubmission(
      submissionId,
      req.user.id,
      { title, content },
    );

    res.status(HTTP_STATUS.OK).json(updateSubmission);
  }

  async deleteSubmission(req, res) {
    const { submissionId } = req.params;

    await this.#submissionService.deleteSubmission(submissionId, req.user.id);
    res.status(HTTP_STATUS.NO_CONTENT).json();
  }
}
