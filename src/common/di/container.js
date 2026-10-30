import { config } from '#config';
import { db } from '#prisma/db.js';
import { SubmissionRepository, UserRepository } from '#repositories';
import { AuthService, SubmissionService, UserService } from '#services';
import {
  AuthController,
  UserController,
  Controller,
  SubmissionController,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';

export const createContainer = () => {
  const userRepository = new UserRepository({ db });
  const submissionRepository = new SubmissionRepository({ db });
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
  const submissionService = new SubmissionService({
    submissionRepository,
  });

  const authMiddleware = new AuthMiddleware({
    tokenProvider,
    authService,
    cookieProvider,
  });

  const authorizationMiddleware = new AuthorizationMiddleware({
    userRepository,
  });

  const authController = new AuthController({
    authService,
    cookieProvider,
  });
  const userController = new UserController({
    userService,
  });
  const submissionController = new SubmissionController({
    submissionService,
  });

  const controller = new Controller({
    authController,
    userController,
    submissionController,
  });

  return { controller, db, authMiddleware };
};
