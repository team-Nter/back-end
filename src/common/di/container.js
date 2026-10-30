import { config } from '#config';
import { db } from '#prisma/db.js';
import { FeedbackRepository, UserRepository } from '#repositories';
import { AuthService, FeedbackService, UserService } from '#services';
import {
  AuthController,
  UserController,
  Controller,
  FeedbackController,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';

export const createContainer = () => {
  const userRepository = new UserRepository({ db });
  const feedbackRepository = new FeedbackRepository({ db });

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
  const feedbackService = new FeedbackService({ feedbackRepository });

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
  const feedbackController = new FeedbackController({
    feedbackService,
  });

  const controller = new Controller({
    authController,
    userController,
    feedbackController,
  });

  return { controller, db, authMiddleware };
};
