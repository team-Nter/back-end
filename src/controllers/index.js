import { format } from 'date-fns';
import { BaseController } from './base.controller.js';

export * from './auth/index.js';
export * from './user/index.js';

export class Controller extends BaseController {
  #authController;
  #socialAuthController;
  #userController;

  constructor({ authController, socialAuthController, userController }) {
    super();
    this.#authController = authController;
    this.#socialAuthController = socialAuthController;
    this.#userController = userController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/auth', this.#socialAuthController.routes());
    this.router.use('/user', this.#userController.routes());

    this.router.get('/ping', (req, res) => this.ping(req, res));

    return this.router;
  }

  ping(_req, res) {
    const time = new Date();
    const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
    const message = `현재 시간: ${formattedTime}`;
    res.status(200).json({ message });
  }
}
