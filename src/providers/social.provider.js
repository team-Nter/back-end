import { ERROR_MESSAGE } from '#constants';
import { UnauthorizedException } from '#exceptions';
import { URLSearchParams } from 'node:url';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export class SocialProvider {
  #googleClientId;
  #googleClientSecret;
  #googleRedirectUrl;
  #state;

  constructor({ config }) {
    this.#googleClientId = config.GOOGLE_CLIENT_ID;
    this.#googleClientSecret = config.GOOGLE_CLIENT_SECRET;
    this.#googleRedirectUrl = `${config.API_BASE_URL}/auth/google`;
    this.#state = config.OAUTH_STATE_SECRET;
  }

  createGoogleUrl() {
    console.log('clientId:', this.#googleClientId);
    console.log('redirectUrl:', this.#googleRedirectUrl);
    const params = new URLSearchParams({
      client_id: this.#googleClientId,
      redirect_uri: this.#googleRedirectUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state: this.#state,
    });
    const url = `${GOOGLE_AUTH_URL}?${params.toString()}`;

    console.log('Google Auth URL:', url);

    return url;
  }

  async getGoogleToken(code) {
    const params = new URLSearchParams({
      code,
      client_id: this.#googleClientId,
      client_secret: this.#googleClientSecret,
      redirect_uri: this.#googleRedirectUrl,
      grant_type: 'authorization_code',
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    console.log('data', data);
    if (!response.ok) {
      throw new Error(
        `Google Token Request Failed: ${data.error_description ?? data.error}`,
      ); // 에러 수정하기
    }

    return data;
  }

  async getGoogleUserInfo(accessToken) {
    const response = await fetch(USER_INFO_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Google UserInfo Request Failed: ${data.error_description ?? data.error}`,
      ); // 에러 수정하기
    }

    return data;
  }

  compareState(state) {
    const isSame = this.#state === state;
    if (!isSame) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_SOCIAL_AUTH_STATE);
    }
  }
}
