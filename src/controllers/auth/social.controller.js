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
  #clientBaseUrl;

  constructor({ socialService, cookieProvider, config }) {
    super();
    this.#socialService = socialService;
    this.#cookieProvider = cookieProvider;
    this.#clientBaseUrl = config.CLIENT_BASE_URL;
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

    const { googleAuthUrl, transactionNonce, codeVerifier } =
      this.#socialService.createGoogleAuth({ next });

    // transactionNonce와 codeVerifier를 임시 쿠키에 저장
    this.#cookieProvider.setSocialCookies(res, {
      transactionNonce,
      codeVerifier,
    });

    return res.redirect(googleAuthUrl);
  }

  async googleCallback(req, res) {
    const { code, state, error } = req.query;

    const { transactionNonce, codeVerifier } =
      this.#cookieProvider.getSocialCookies(req);

    const stateResult = this.#socialService.verifyGoogleState({
      state,
      transactionNonce,
      codeVerifier,
    });

    this.#cookieProvider.clearSocialCookies(res);

    if (!stateResult) {
      throw new UnauthorizedException(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }

    if (error) {
      throw new UnauthorizedException(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }

    if (!code || typeof code !== 'string') {
      throw new BadRequestException(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }

    const { tokens } = await this.#socialService.googleLogin(
      code,
      codeVerifier,
    );

    this.#cookieProvider.setAuthCookies(res, tokens);

    const redirectUrl = new URL(stateResult.next, this.#clientBaseUrl);

    return res.redirect(redirectUrl.toString());
  }
}
