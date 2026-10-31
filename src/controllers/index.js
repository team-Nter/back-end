import { BaseController } from './base.controller.js';

export * from './auth/index.js';
export * from './user/index.js';
export * from './challenge/challenge.controller.js';

export class Controller extends BaseController {
  #authController;
  #userController;
  #challengeController;

  constructor({ authController, userController, challengeController }) {
    super();
    this.#authController = authController;
    this.#userController = userController;
    this.#challengeController = challengeController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/users', this.#userController.routes());
    this.router.use('/challenges', this.#challengeController.routes());

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
