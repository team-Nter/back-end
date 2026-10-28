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

  async getSubmission(req, res) {
    const { submissionId } = req.params;
    const submission =
      await this.#submissionService.getSubmission(submissionId);
    res.status(HTTP_STATUS.OK).json(submission);
  }
}
