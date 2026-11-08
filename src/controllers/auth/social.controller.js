import { BadRequestException, UnauthorizedException } from '#exceptions';
import { BaseController } from '../base.controller.js';
import { ERROR_MESSAGE } from '#constants';
import { validate } from '#middlewares';
import {
  socialCallbackQuerySchema,
  socialLoginQuerySchema,
} from './dto/social.dto.js';

export class SocialController extends BaseController {
  #socialService;
  #cookieProvider;

  constructor({ socialService, cookieProvider }) {
    super();
    this.#socialService = socialService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.get(
      '/google',
      validate('query', socialLoginQuerySchema),
      (req, res) => this.googleRedirect(req, res),
    );
    this.router.get(
      '/google/callback',
      validate('query', socialCallbackQuerySchema),
      (req, res) => this.googleCallback(req, res),
    );

    return this.router;
  }

  async googleRedirect(req, res) {
    const { next } = req.query; // 스키마로 유효한지 확인

    const googleAuthUrl = this.#socialService.createGoogleAuth();
    console.log('googleRedirect');
    return res.redirect(googleAuthUrl);
  }

  async googleCallback(req, res) {
    const {
      code,
      state,
      error,
      error_description: errorDescription,
    } = req.query;

    if (error) {
      throw new UnauthorizedException(
        errorDescription || ERROR_MESSAGE.SOCIAL_AUTH_FAILED,
      );
    }

    if (!code || typeof code !== 'string') {
      throw new BadRequestException('invalid code'); // 에러메시지 추천
    }

    const { user, tokens } = await this.#socialService.googleLogin(code, state);

    //반환된 Nter Access Token과 Refresh Token 확인

    this.#cookieProvider.setAuthCookies(res, tokens);

    // const redirectUrl = `${config.CLIENT_BASE_URL}/${next}`;

    // return res.redirect(redirectUrl); next를 어떻게 가져오지
  }
}
