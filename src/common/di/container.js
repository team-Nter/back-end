import { config } from '#config';
import { db } from '#prisma/db.js';
import { UserRepository } from '#repositories';
import { AuthService, UserService } from '#services';
import {
  AuthController,
  UserController,
  Controller,
  socialAuthController,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware } from '#middlewares';

export const createContainer = () => {
  const userRepository = new UserRepository({ db });

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

  const authMiddleware = new AuthMiddleware({
    tokenProvider,
    authService,
    cookieProvider,
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
    socialAuthController,
  });

  return { controller, db, authMiddleware };
};
