import { config } from '#config';
import { db } from '#prisma/db.js';
import {
  UserRepository,
  ChallengeRepository,
  SubmissionRepository,
  ModerationLogRepository,
  ParticipationRepository,
  FeedbackRepository,
  NotificationRepository,
} from '#repositories';
import {
  AuthService,
  UserService,
  ChallengeService,
  SubmissionService,
  ModerationLogService,
  ParticipationService,
  FeedbackService,
  NotificationService,
  SocialService,
} from '#services';
import {
  AuthController,
  UserController,
  ChallengeController,
  SubmissionController,
  ModerationLogController,
  ParticipationController,
  FeedbackController,
  SocialController,
  Controller,
} from '#controllers';
import {
  PasswordProvider,
  TokenProvider,
  CookieProvider,
  SocialProvider,
  OAuthStateProvider,
} from '#providers';
import { AuthMiddleware, AuthorizationMiddleware } from '#middlewares';

export const createContainer = () => {
  // Repositories
  const userRepository = new UserRepository({ db });
  const submissionRepository = new SubmissionRepository({ db });
  const challengeRepository = new ChallengeRepository({ db });
  const moderationLogRepository = new ModerationLogRepository({ db });
  const participationRepository = new ParticipationRepository({ db });
  const feedbackRepository = new FeedbackRepository({ db });
  const notificationRepository = new NotificationRepository({ db });

  // Providers
  const passwordProvider = new PasswordProvider();
  const tokenProvider = new TokenProvider({ config });
  const cookieProvider = new CookieProvider({ config });
  const socialProvider = new SocialProvider({ config });
  const oauthStateProvider = new OAuthStateProvider({ config });

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
    db,
    challengeRepository,
    moderationLogRepository,
    participationRepository,
    submissionRepository,
  });

  const submissionService = new SubmissionService({
    db,
    submissionRepository,
    challengeRepository,
    participationRepository,
  });
  const participationService = new ParticipationService({
    db,
    participationRepository,
    challengeRepository,
  });

  const feedbackService = new FeedbackService({
    db,
    feedbackRepository,
    submissionRepository,
    challengeRepository,
  });

  const moderationLogService = new ModerationLogService({
    db,
    challengeRepository,
    moderationLogRepository,
    notificationRepository,
    participationRepository,
  });

  const notificationService = new NotificationService({
    notificationRepository,
  });

  const socialService = new SocialService({
    userRepository,
    socialProvider,
    tokenProvider,
    oauthStateProvider,
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
    notificationService,
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
    authz: authorizationMiddleware,
  });

  const moderationLogController = new ModerationLogController({
    moderationLogService,
    authz: authorizationMiddleware,
  });

  const socialController = new SocialController({
    socialService,
    cookieProvider,
    config,
  });

  const controller = new Controller({
    authController,
    userController,
    challengeController,
    submissionController,
    moderationLogController,
    participationController,
    feedbackController,
    socialController,
  });

  return { controller, db, authMiddleware };
};
