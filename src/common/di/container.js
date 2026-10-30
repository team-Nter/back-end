import { config } from '#config';
import { db } from '#prisma/db.js';
import { UserRepository, ParticipationRepository } from '#repositories';
import { AuthService, UserService, ParticipationService } from '#services';
import {
  AuthController,
  UserController,
  Controller,
  ParticipationController,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';

export const createContainer = () => {
  const userRepository = new UserRepository({ db });
  const participationRepository = new ParticipationRepository({ db });
  const passwordProvider = new PasswordProvider();
  const tokenProvider = new TokenProvider({ config });
  const cookieProvider = new CookieProvider({ config });

  const authService = new AuthService({
    userRepository,
    passwordProvider,
    tokenProvider,
  });

  const participationService = new ParticipationService({
    participationRepository,
    // TODO: #9 머지 후 challengeRepository 연결
  });

  const userService = new UserService({
    userRepository,
    passwordProvider,
  });

  const authMiddleware = new AuthMiddleware({
    tokenProvider,
    authService,
    cookieProvider,
  });

  const authorizationMiddleware = new AuthorizationMiddleware({
    userRepository,
  });

  const participationController = new ParticipationController({
    participationService,
    authz: authorizationMiddleware,
  });

  const authController = new AuthController({
    authService,
    cookieProvider,
  });
  const userController = new UserController({
    userService,
  });

  const controller = new Controller({
    authController,
    userController,
    participationController,
  });

  return { controller, db, authMiddleware };
};
