import { BaseController } from '../base.controller.js';
import { ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { signUpSchema, loginSchema } from './dto/auth.dto.js';
import { UnauthorizedException } from '#exceptions';

export class AuthController extends BaseController {
  #authService;
  #cookieProvider;

  constructor({ authService, cookieProvider }) {
    super();
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.post('/signup', validate('body', signUpSchema), (req, res) =>
      this.signUp(req, res),
    );
    this.router.post('/login', validate('body', loginSchema), (req, res) =>
      this.login(req, res),
    );
    this.router.post('/logout', (req, res) => this.logout(req, res));
    this.router.get('/me', (req, res) => this.me(req, res));

    return this.router;
  }

  async signUp(req, res) {
    const { user, tokens } = await this.#authService.signUp(req.body);
    const { passwordHash, ...rest } = user;
    this.#cookieProvider.setAuthCookies(res, tokens);

    return res.status(HTTP_STATUS.CREATED).json(rest);
  }

  async login(req, res) {
    const { email, password } = req.body;
    const { user, tokens } = await this.#authService.login({
      email,
      password,
    });
    this.#cookieProvider.setAuthCookies(res, tokens);
    const { passwordHash, ...rest } = user;

    return res.status(HTTP_STATUS.OK).json(rest);
  }

  logout(_req, res) {
    this.#cookieProvider.clearAuthCookies(res);
    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async me(req, res) {
    if (!req.user) {
      throw new UnauthorizedException(ERROR_MESSAGE.UNAUTHORIZED);
    }

    const user = await this.#authService.getMe(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  }
}
