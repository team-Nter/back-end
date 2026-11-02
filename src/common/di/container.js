import { config } from '#config';
import { db } from '#prisma/db.js';
import {
  UserRepository,
  ChallengeRepository,
  SubmissionRepository,
  ModerationLogRepository,
  ParticipationRepository,
  FeedbackRepository,
} from '#repositories';
import {
  AuthService,
  UserService,
  ChallengeService,
  SubmissionService,
  ModerationLogService,
  ParticipationService,
  FeedbackService,
} from '#services';
import {
  AuthController,
  UserController,
  ChallengeController,
  SubmissionController,
  ModerationLogController,
  ParticipationController,
  FeedbackController,
  Controller,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';

export const createContainer = () => {
  // Repositories
  const userRepository = new UserRepository({ db });
  const submissionRepository = new SubmissionRepository({ db });
  const challengeRepository = new ChallengeRepository({ db });
  const moderationLogRepository = new ModerationLogRepository({ db });
  const participationRepository = new ParticipationRepository({ db });
  const feedbackRepository = new FeedbackRepository({ db });

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

  const challengeService = new ChallengeService({
    challengeRepository,
    moderationLogRepository,
  });

  const submissionService = new SubmissionService({
    submissionRepository,
    challengeRepository,
  });
  const participationService = new ParticipationService({
    participationRepository,
    challengeRepository,
  });

  // Middlewares
  const feedbackService = new FeedbackService({ feedbackRepository });

  const moderationLogService = new ModerationLogService({
    db,
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
  const submissionController = new SubmissionController({
    submissionService,
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
  const feedbackController = new FeedbackController({
    feedbackService,
  });

  const moderationLogController = new ModerationLogController({
    moderationLogService,
    authz: authorizationMiddleware,
  });

  const controller = new Controller({
    authController,
    userController,
    challengeController,
    submissionController,
    moderationLogController,
    participationController,
    feedbackController,
  });

  return { controller, db, authMiddleware };
};
