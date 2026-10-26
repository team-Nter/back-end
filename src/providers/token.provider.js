import { MINUTE_IN_SECONDS } from '#constants';
import jwt from 'jsonwebtoken';

export class TokenProvider {
  #accessSecret;
  #refreshSecret;

  constructor({ config }) {
    this.#accessSecret = config.JWT_ACCESS_SECRET;
    this.#refreshSecret = config.JWT_REFRESH_SECRET;
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        name: user.name,
      },
      this.#accessSecret,
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ userId: user.id }, this.#refreshSecret, {
      expiresIn: '7d',
    });
  }

  generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    return this.#verifyToken(token, this.#accessSecret);
  }

  verifyRefreshToken(token) {
    return this.#verifyToken(token, this.#refreshSecret);
  }

  shouldRefreshAccessToken(payload) {
    if (!payload?.exp) {
      return false;
    }

    const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
    return expiresIn < MINUTE_IN_SECONDS * 5 && expiresIn > 0;
  }

  #verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  }
}
