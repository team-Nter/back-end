import { ERROR_MESSAGE } from '#constants';
import { ConflictException, UnauthorizedException } from '#exceptions';

export class SocialService {
  #userRepository;
  #socialProvider;
  #tokenProvider;

  constructor({ userRepository, socialProvider, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#socialProvider = socialProvider;
    this.#tokenProvider = tokenProvider;
  }

  createGoogleAuth() {
    console.log('createGoogleAuth');
    return this.#socialProvider.createGoogleUrl();
  }

  async loginOrCreateGoogleUser(userInfo) {
    if (!userInfo.email_verified) {
      throw new UnauthorizedException(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }
    const existingUser = await this.#userRepository.findBySub(userInfo.sub);

    if (existingUser) {
      const tokens = this.#tokenProvider.generateTokens(existingUser);
      return { user: existingUser, tokens };
    }
    // providerId중복은 로그인되는데 이메일 중복은 에러처리?
    // 기존 Google 회원은 로그인하고, 기존 LOCAL 회원과 이메일이 충돌하면 가입을 거부
    // 이메일 중복
    const existingEmail = await this.#userRepository.findByEmail(
      userInfo.email,
    );

    if (existingEmail) {
      throw new ConflictException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
      // 프론트에서 어떻게 보여줄지
    }

    const user = await this.#userRepository.create({
      email: userInfo.email,
      provider: 'GOOGLE',
      providerId: userInfo.sub,
    });

    const tokens = this.#tokenProvider.generateTokens(user);

    return { user, tokens };

    // 회원이 없으면 Nter 회원 생성
    // Nter 자체 Access Token과 Refresh Token 발급
  }

  async googleLogin(code, state) {
    this.#socialProvider.compareState(state);
    const googleTokens = await this.#socialProvider.getGoogleToken(code);
    const userInfo = await this.#socialProvider.getGoogleUserInfo(
      googleTokens.access_token,
    );

    return this.loginOrCreateGoogleUser(userInfo);
  }
}
