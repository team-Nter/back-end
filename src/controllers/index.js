import { BaseController } from './base.controller.js';

export * from './auth/index.js';
export * from './user/index.js';
export * from './challenge/challenge.controller.js';
export * from './submission/index.js';
export * from './participation/index.js';
export * from './feedback/index.js';
export class Controller extends BaseController {
  #authController;
  #userController;
  #challengeController;
  #submissionController;
  #participationController;
  #feedbackController;

  constructor({
    authController,
    userController,
    challengeController,
    submissionController,
    participationController,
    feedbackController,
  }) {
    super();
    this.#authController = authController;
    this.#userController = userController;
    this.#challengeController = challengeController;
    this.#submissionController = submissionController;
    this.#participationController = participationController;
    this.#feedbackController = feedbackController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/users', this.#userController.routes());
    this.router.use('/challenges', this.#challengeController.routes());
    this.router.use(
      '/challenges/:challengeId/participants',
      this.#participationController.routes(),
    );
    this.router.use(
      '/submission/:submissionId/feedbacks',
      this.#feedbackController.submissionRoutes(),
    );
    this.router.use('/feedback', this.#feedbackController.routes());
    this.router.get('/ping', (req, res) => this.ping(req, res));
    this.router.use('/submission', this.#submissionController.routes());
    this.router.use(
      '/challenges/:challengeId/submissions',
      this.#submissionController.challengeRoutes(),
    );
    return this.router;
  }

  ping(_req, res) {
    const time = new Date();
    const formattedTime = time.toLocaleString('sv-SE', {
      timeZone: 'Asia/Seoul',
    });
    const message = `현재 시간: ${formattedTime}`;
    res.status(200).json({ message });
  }
}
