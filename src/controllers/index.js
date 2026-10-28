import { BaseController } from './base.controller.js';

export * from './auth/index.js';
export * from './user/index.js';
export * from './submission/index.js';

export class Controller extends BaseController {
  #authController;
  #userController;
  #submissionController;

  constructor({ authController, userController, submissionController }) {
    super();
    this.#authController = authController;
    this.#userController = userController;
    this.#submissionController = submissionController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/user', this.#userController.routes());

    this.router.get('/ping', (req, res) => this.ping(req, res));
    this.router.use('/submission', this.#submissionController.routes());
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
