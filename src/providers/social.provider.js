import { ERROR_MESSAGE } from '#constants';
import { ForbiddenException, UnauthorizedException } from '#exceptions';
import { URLSearchParams } from 'node:url';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export class SocialProvider {
  #googleClientId;
  #googleClientSecret;
  #googleRedirectUrl;

  constructor({ config }) {
    this.#googleClientId = config.GOOGLE_CLIENT_ID;
    this.#googleClientSecret = config.GOOGLE_CLIENT_SECRET;
    this.#googleRedirectUrl = `${config.API_BASE_URL.replace(/\/+$/, '')}/auth/google/callback`;
  }

  createGoogleUrl({ state, codeChallenge }) {
    const params = new URLSearchParams({
      client_id: this.#googleClientId,
      redirect_uri: this.#googleRedirectUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  async getGoogleToken(code, codeVerifier) {
    const params = new URLSearchParams({
      code,
      client_id: this.#googleClientId,
      client_secret: this.#googleClientSecret,
      redirect_uri: this.#googleRedirectUrl,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Google OAuth] Token request failed', {
        status: response.status,
        error: data.error,
      });

      switch (data.error) {
        case 'invalid_grant':
          throw new UnauthorizedException(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);

        case 'invalid_client':
          throw new Error(ERROR_MESSAGE.SOCIAL_CONFIG_ERROR);

        case 'invalid_request':
        case 'unauthorized_client':
        case 'unsupported_grant_type':
          throw new Error(ERROR_MESSAGE.SOCIAL_REQUEST_FAILED);

        default:
          throw new Error(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
      }
    }

    return data;
  }

  async getGoogleUserInfo(accessToken) {
    const response = await fetch(USER_INFO_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedException(ERROR_MESSAGE.UNAUTHORIZED);
      }

      if (response.status === 403) {
        throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
      }

      throw new Error(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }

    return data;
  }
}
