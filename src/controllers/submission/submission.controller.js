import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { BaseController } from '../base.controller.js';
import { challengeIdParamSchema } from '../challenge/dto/challenge.dto.js';
import {
  submissionParamsSchema,
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
    this.router.get(
      '/:submissionId',
      this.#authz.requireAuth,
      validate('params', submissionParamsSchema),
      (req, res) => this.getSubmission(req, res),
    );
    this.router.patch(
      '/:submissionId',
      this.#authz.requireAuth,
      this.#authz.requireRole('USER', 'ADMIN'),
      validate('params', submissionParamsSchema),
      validate('body', updateSubmissionSchema),
      (req, res) => this.updateSubmission(req, res),
    );
    this.router.delete(
      '/:submissionId',
      this.#authz.requireAuth,
      this.#authz.requireRole('USER', 'ADMIN'),
      validate('params', submissionParamsSchema),
      (req, res) => this.deleteSubmission(req, res),
    );

    return this.router;
  }

  challengeRoutes() {
    const router = this.createRouter({ mergeParams: true });

    router.get('/', validate('params', challengeIdParamSchema), (req, res) =>
      this.getSubmissions(req, res),
    );
    router.post(
      '/',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),

      validate('body', submissionSchema),
      (req, res) => this.createSubmission(req, res),
    );
    return router;
  }

  async getSubmission(req, res) {
    const { submissionId } = req.params;
    const userId = req.user.id;

    const submission = await this.#submissionService.getSubmission(
      submissionId,
      userId,
    );
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
    const userId = req.user.id;
    const { title, content } = req.body;
    const submission = await this.#submissionService.createSubmission(
      challengeId,
      userId,
      {
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
      req.user.role,
    );

    res.status(HTTP_STATUS.OK).json(updateSubmission);
  }

  async deleteSubmission(req, res) {
    const { submissionId } = req.params;

    await this.#submissionService.deleteSubmission(
      submissionId,
      req.user.id,
      req.user.role,
    );
    res.status(HTTP_STATUS.NO_CONTENT).json();
  }
}
