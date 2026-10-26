import { BaseController } from '#controllers/base.controller.js';
import { ERROR_MESSAGE } from '#constants';
import { config } from '#config';
import { BadRequestException, UnauthorizedException } from '#exceptions';
import { SocialAuthService } from '#services';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  socialProviderParamSchema,
  socialLoginQuerySchema,
  socialCallbackQuerySchema,
} from './dto/social.dto.js';

export class SocialAuthController extends BaseController {
  #socialAuthService;
  #cookieProvider;
  #oauthStateProvider;

  constructor({ socialAuthService, cookieProvider, oauthStateProvider }) {
    super();
    this.#socialAuthService = socialAuthService;
    this.#cookieProvider = cookieProvider;
    this.#oauthStateProvider = oauthStateProvider;
  }

  routes() {
    this.router.get(
      '/social/:provider/login',
      validate('params', socialProviderParamSchema),
      validate('query', socialLoginQuerySchema),
      (req, res) => this.socialRedirect(req, res),
    );

    this.router.get(
      '/social/callback/:provider',
      (req, res, next) => {
        this.#cookieProvider.clearOAuthTransactionCookies(res);
        next();
      },
      validate('params', socialProviderParamSchema),
      validate('query', socialCallbackQuerySchema),
      (req, res) => this.socialCallback(req, res),
    );

    return this.router;
  }

  async socialRedirect(req, res) {
    const { provider } = req.params;
    const { next } = req.query;
    const { state, transactionNonce, codeVerifier, codeChallenge } =
      this.#oauthStateProvider.createState({
        provider,
        next,
      });
    this.#cookieProvider.setOAuthTransactionCookies(res, {
      transactionNonce,
      codeVerifier,
    });

    const loginUrl = this.#loginUrlGenerators[provider]({
      state,
      codeChallenge,
    });
    res.redirect(loginUrl);
  }

  async socialCallback(req, res) {
    const { provider } = req.params;
    const {
      code,
      state,
      error,
      error_description: errorDescription,
    } = req.query;
    const codeVerifier = this.#cookieProvider.getOAuthCodeVerifier(req);
    const transaction = this.#oauthStateProvider.verifyState({
      state,
      provider,
      transactionNonce: this.#cookieProvider.getOAuthTransactionNonce(req),
      codeVerifier,
    });

    if (!transaction) {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_SOCIAL_AUTH_STATE);
    }

    if (error) {
      throw new UnauthorizedException(
        errorDescription || ERROR_MESSAGE.SOCIAL_AUTH_FAILED,
      );
    }

    const profile = await this.#socialAuthService.getSocialProfile(provider, {
      code,
      state,
      codeVerifier,
    });
    const { tokens } = await this.#socialAuthService.loginOrSignUp({
      provider,
      profile,
    });

    this.#cookieProvider.setAuthCookies(res, tokens);

    const redirectUrl = new URL(
      transaction.next,
      config.CLIENT_BASE_URL,
    ).toString();

    return res.redirect(redirectUrl);
  }

  #loginUrlGenerators = {
    google: ({ state, codeChallenge }) => {
      const params = new URLSearchParams({
        client_id: config.GOOGLE_CLIENT_ID,
        redirect_uri: SocialAuthService.getCallbackUri('google'),
        response_type: 'code',
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    },
  };
}
