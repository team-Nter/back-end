import { DB_ERROR, ERROR_MESSAGE, createGuestNickname } from '#constants';
import { ConflictException, UnauthorizedException } from '#exceptions';

export class SocialService {
  #userRepository;
  #socialProvider;
  #tokenProvider;
  #oauthStateProvider;

  constructor({
    userRepository,
    socialProvider,
    tokenProvider,
    oauthStateProvider,
  }) {
    this.#userRepository = userRepository;
    this.#socialProvider = socialProvider;
    this.#tokenProvider = tokenProvider;
    this.#oauthStateProvider = oauthStateProvider;
  }

  createGoogleAuth({ next }) {
    const stateData = this.#oauthStateProvider.createState({
      next,
    });

    const googleAuthUrl = this.#socialProvider.createGoogleUrl({
      state: stateData.state,
      codeChallenge: stateData.codeChallenge,
    });

    return {
      googleAuthUrl,
      transactionNonce: stateData.transactionNonce,
      codeVerifier: stateData.codeVerifier,
    };
  }

  async loginOrCreateGoogleUser(userInfo) {
    if (!userInfo.sub || !userInfo.email || userInfo.email_verified !== true) {
      throw new UnauthorizedException(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }
    const existingUser = await this.#userRepository.findByEmail(userInfo.email);

    if (existingUser) {
      if (
        existingUser.provider === 'GOOGLE' &&
        existingUser.providerId === userInfo.sub
      ) {
        const tokens = this.#tokenProvider.generateTokens(existingUser);
        return { user: existingUser, tokens };
      }

      throw new ConflictException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
    }

    let user;

    try {
      user = await this.#userRepository.create({
        email: userInfo.email,
        provider: 'GOOGLE',
        providerId: userInfo.sub,
        nickname: createGuestNickname(),
      });
    } catch (error) {
      if (error.sqlState === DB_ERROR.UNIQUE_VIOLATION) {
        user = await this.#userRepository.findBySub(userInfo.sub);

        if (
          !user ||
          user.provider !== 'GOOGLE' ||
          user.providerId !== userInfo.sub
        ) {
          throw new ConflictException(ERROR_MESSAGE.RESOURCE_CONFLICT);
        }
      } else {
        throw error;
      }
    }

    const tokens = this.#tokenProvider.generateTokens(user);

    return { user, tokens };
  }

  async googleLogin(code, codeVerifier) {
    const googleTokens = await this.#socialProvider.getGoogleToken(
      code,
      codeVerifier,
    );

    if (!googleTokens.access_token) {
      throw new Error(ERROR_MESSAGE.NO_AUTH_TOKEN);
    }

    const userInfo = await this.#socialProvider.getGoogleUserInfo(
      googleTokens.access_token,
    );

    return this.loginOrCreateGoogleUser(userInfo);
  }

  verifyGoogleState({ state, transactionNonce, codeVerifier }) {
    return this.#oauthStateProvider.verifyState({
      state,
      transactionNonce,
      codeVerifier,
    });
  }
}
