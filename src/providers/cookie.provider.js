import { DAY_IN_MS, MINUTE_IN_MS } from '#constants';

export class CookieProvider {
  #isProduction;

  constructor({ config }) {
    this.#isProduction = config.NODE_ENV === 'production';
  }

  setAuthCookies(res, tokens) {
    const { accessToken, refreshToken } = tokens;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.#isProduction,
      sameSite: 'lax',
      maxAge: 15 * MINUTE_IN_MS,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.#isProduction,
      sameSite: 'lax',
      maxAge: 7 * DAY_IN_MS,
      path: '/',
    });
  }

  clearAuthCookies(res) {
    res.clearCookie('accessToken', {
      secure: this.#isProduction,
      path: '/',
    });
    res.clearCookie('refreshToken', {
      secure: this.#isProduction,
      path: '/',
    });
  }
}
