import { BaseController } from './base.controller.js';

export * from './auth/index.js';
export * from './user/index.js';
export * from './participation/index.js';

export class Controller extends BaseController {
  #authController;
  #userController;
  #participationController;

  constructor({ authController, userController, participationController }) {
    super();
    this.#authController = authController;
    this.#userController = userController;
    this.#participationController = participationController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/user', this.#userController.routes());
    this.router.use(
      '/challenges/:challengeId/participants',
      this.#participationController.routes(),
    );
    this.router.get('/ping', (req, res) => this.ping(req, res));

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
