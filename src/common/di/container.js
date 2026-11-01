import { config } from '#config';
import { db } from '#prisma/db.js';
import {
  UserRepository,
  ChallengeRepository,
  SubmissionRepository,
} from '#repositories';
import {
  AuthService,
  UserService,
  ChallengeService,
  SubmissionService,
} from '#services';
import {
  AuthController,
  UserController,
  ChallengeController,
  SubmissionController,
  Controller,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';

export const createContainer = () => {
  const userRepository = new UserRepository({ db });
  const submissionRepository = new SubmissionRepository({ db });
  const challengeRepository = new ChallengeRepository({ db });
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

  const challengeService = new ChallengeService({ challengeRepository });
  const submissionService = new SubmissionService({
    submissionRepository,
    challengeRepository,
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
    challengeService,
    authz: authorizationMiddleware,
  });

  const submissionController = new SubmissionController({
    submissionService,
    authz: authorizationMiddleware,
  });

  const controller = new Controller({
    authController,
    userController,
    challengeController,
    submissionController,
  });

  return { controller, db, authMiddleware };
};
