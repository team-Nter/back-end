import { ERROR_MESSAGE } from '#constants';
import { UnauthorizedException, ForbiddenException } from '#exceptions';

export class AuthorizationMiddleware {
  #userRepository;

  constructor({ userRepository }) {
    this.#userRepository = userRepository;
  }

  requireAuth = (req, _res, next) => {
    if (!req.user) {
      throw new UnauthorizedException(ERROR_MESSAGE.UNAUTHORIZED);
    }
    next();
  };

  requireRole =
    (...roles) =>
    async (req, _res, next) => {
      if (!req.user) {
        throw new UnauthorizedException(ERROR_MESSAGE.UNAUTHORIZED);
      }
      const user = await this.#userRepository.findByIdWithAuthFields(
        req.user.id,
      );

      if (!user) {
        throw new UnauthorizedException(
          ERROR_MESSAGE.USER_NOT_FOUND_FROM_TOKEN,
        );
      }

      if (!roles.includes(user.role)) {
        throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
      }

      req.user.role = user.role;
      next();
    };

  requireAdmin = this.requireRole('ADMIN');
}
