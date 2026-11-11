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
    this.router.get('/google/callback', (req, res) => {
      const result = socialCallbackQuerySchema.safeParse(req.query);

      if (!result.success) {
        return this.#redirectToLogin(res, ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
      }

      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });

      return this.googleCallback(req, res);
    });

    return this.router;
  }

  async googleRedirect(req, res) {
    const { next } = req.query;

    const { googleAuthUrl, transactionNonce, codeVerifier } =
      this.#socialService.createGoogleAuth({ next });

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

    if (!stateResult) {
      return this.#redirectToLogin(res, ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }

    // state 검증 성공 후 쿠키 삭제
    this.#cookieProvider.clearSocialCookies(res);

    if (error) {
      return this.#redirectToLogin(res, ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }

    if (!code || typeof code !== 'string') {
      return this.#redirectToLogin(res, ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }

    try {
      const { tokens } = await this.#socialService.googleLogin(
        code,
        codeVerifier,
      );

      this.#cookieProvider.setAuthCookies(res, tokens);

      const redirectUrl = new URL(stateResult.next, this.#clientBaseUrl);

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      if (error.message === ERROR_MESSAGE.EMAIL_ALREADY_EXISTS) {
        return this.#redirectToLogin(res, ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
      }

      console.error('[Google OAuth] Login failed', {
        message: error.message,
        name: error.name,
      });

      return this.#redirectToLogin(res, ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }
  }

  #redirectToLogin(res, error) {
    const redirectUrl = new URL('/login', this.#clientBaseUrl);

    redirectUrl.searchParams.set('error', error);

    return res.redirect(redirectUrl.toString());
  }
}
