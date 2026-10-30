import { config } from '#config';
import { db } from '#prisma/db.js';
import { UserRepository, ChallengeRepository } from '#repositories';
import { AuthService, UserService, ChallengeService } from '#services';
import {
  AuthController,
  UserController,
  ChallengeController,
  Controller,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';
import { ModerationLogRepository } from '../../repositories/moderation-log.repository.js';

export const createContainer = () => {
  const userRepository = new UserRepository({ db });
  const challengeRepository = new ChallengeRepository({ db });
  const moderationLogRepository = new ModerationLogRepository({ db });

  const passwordProvider = new PasswordProvider();
  const tokenProvider = new TokenProvider({ config });
  const cookieProvider = new CookieProvider({ config });

  const authService = new AuthService({
    userRepository,
    passwordProvider,
    tokenProvider,
  });
  const userService = new UserService({
    userRepository,
    passwordProvider,
  });

  const challengeService = new ChallengeService({
    challengeRepository,
    moderationLogRepository,
  });

  const authMiddleware = new AuthMiddleware({
    tokenProvider,
    authService,
    cookieProvider,
  });

  const authorizationMiddleware = new AuthorizationMiddleware({
    userRepository,
  });

  const challengeController = new ChallengeController({
    challengeService,
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
    challengeController,
  });

  return { controller, db, authMiddleware };
};
