import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { BaseController } from '../base.controller.js';
import { challengeIdParamSchema } from '../challenge/dto/challenge.dto.js';
import { submissionDraftSchema } from './dto/submission-draft.dto.js';

export class SubmissionDraftController extends BaseController {
  #authz;
  #submissionDraftService;

  constructor({ authz, submissionDraftService }) {
    super();
    this.router = this.createRouter({ mergeParams: true });
    this.#authz = authz;
    this.#submissionDraftService = submissionDraftService;
  }

  routes() {
    this.router.get(
      '/',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      (req, res) => this.getSubmissionDraft(req, res),
    );
    this.router.put(
      '/',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      validate('body', submissionDraftSchema),
      (req, res) => this.putSubmissionDraft(req, res),
    );
    this.router.delete(
      '/',
      this.#authz.requireAuth,
      validate('params', challengeIdParamSchema),
      (req, res) => this.deleteSubmissionDraft(req, res),
    );

    return this.router;
  }

  async getSubmissionDraft(req, res) {
    const { challengeId } = req.params;
    const userId = req.user.id;

    const submissionDraft =
      await this.#submissionDraftService.getSubmissionDraft(
        challengeId,
        userId,
      );
    res.status(HTTP_STATUS.OK).json(submissionDraft);
  }

  async putSubmissionDraft(req, res) {
    const { challengeId } = req.params;
    const userId = req.user.id;
    const { title, content } = req.body;

    const submissionDraft =
      await this.#submissionDraftService.putSubmissionDraft(
        challengeId,
        userId,
        title,
        content,
      );
    res.status(HTTP_STATUS.OK).json(submissionDraft);
  }

  async deleteSubmissionDraft(req, res) {
    const { challengeId } = req.params;
    const userId = req.user.id;

    await this.#submissionDraftService.deleteSubmissionDraft(
      challengeId,
      userId,
    );
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
