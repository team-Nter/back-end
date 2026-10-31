import { config } from '#config';
import { db } from '#prisma/db.js';
import {
  UserRepository,
  ChallengeRepository,
  ParticipationRepository,
} from '#repositories';
import {
  AuthService,
  UserService,
  ChallengeService,
  ParticipationService,
} from '#services';
import {
  AuthController,
  UserController,
  ChallengeController,
  ParticipationController,
  Controller,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';

export const createContainer = () => {
  // Repositories
  const userRepository = new UserRepository({ db });
  const challengeRepository = new ChallengeRepository({ db });
  const participationRepository = new ParticipationRepository({ db });

  // Providers
  const passwordProvider = new PasswordProvider();
  const tokenProvider = new TokenProvider({ config });
  const cookieProvider = new CookieProvider({ config });

  // Services
  const authService = new AuthService({
    userRepository,
    passwordProvider,
    tokenProvider,
  });
  const userService = new UserService({
    userRepository,
    passwordProvider,
  });
  const challengeService = new ChallengeService({ challengeRepository });
  const participationService = new ParticipationService({
    participationRepository,
    challengeRepository,
  });

  // Middlewares
  const authMiddleware = new AuthMiddleware({
    tokenProvider,
    authService,
    cookieProvider,
  });
  const authorizationMiddleware = new AuthorizationMiddleware({
    userRepository,
  });

  // Controllers
  const authController = new AuthController({
    authService,
    cookieProvider,
  });
  const userController = new UserController({
    userService,
    challengeService,
    authz: authorizationMiddleware,
  });
  const challengeController = new ChallengeController({
    challengeService,
    authz: authorizationMiddleware,
  });
  const participationController = new ParticipationController({
    participationService,
    authz: authorizationMiddleware,
  });

  const controller = new Controller({
    authController,
    userController,
    challengeController,
    participationController,
  });

  return { controller, db, authMiddleware };
};
