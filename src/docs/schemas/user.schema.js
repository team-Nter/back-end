import { z } from 'zod';
import {
  dateTime,
  id,
  nickname,
  paginationSchema,
  userGradeSchema,
} from './common.schema.js';

export const meSchema = z
  .object({
    id: id(1),
    email: z.email().meta({ example: 'docthru@example.com' }),
    nickname,
    role: z.enum(['USER', 'ADMIN']).meta({ example: 'USER' }),
    grade: userGradeSchema,
    provider: z.enum(['LOCAL', 'GOOGLE']).meta({ example: 'LOCAL' }),
    createdAt: dateTime,
  })
  .meta({ id: 'Me' });

export const publicUserSchema = z
  .object({
    id: id(1),
    nickname,
    grade: userGradeSchema,
    createdAt: dateTime,
  })
  .meta({ id: 'PublicUser' });

export const notificationTypeSchema = z
  .enum([
    'CHALLENGE_PARTICIPATION',
    'SUBMISSION_RECEIVED',
    'SUBMISSION_CHANGED',
    'SUBMISSION_DELETED',
    'FEEDBACK_RECEIVED',
    'FEEDBACK_CHANGED',
    'FEEDBACK_DELETED',
    'SUBMISSION_LIKED',
    'CHALLENGE_CANCELED',
    'CHALLENGE_CLOSED',
    'SUBMISSION_CANCELED',
    'CHALLENGE_REJECTED',
    'CHALLENGE_APPROVED',
  ])
  .meta({ example: 'SUBMISSION_RECEIVED' });

export const notificationSchema = z
  .object({
    id: id(15),
    type: notificationTypeSchema,
    message: z.string().meta({
      example:
        "'Next.js App Router 공식 문서 번역' 챌린지에 새 작업물이 제출되었습니다.",
    }),
    challengeId: id(3).nullable(),
    submissionId: id(8).nullable(),
    feedbackId: id(21).nullable(),
    readAt: dateTime.nullable().meta({ description: '읽지 않았으면 null' }),
    recipientId: id(1),
    createdAt: dateTime,
  })
  .meta({ id: 'Notification' });

export const notificationListSchema = z
  .object({
    items: z.array(notificationSchema),
    pagination: paginationSchema,
    unreadCount: id(3).meta({
      description: 'isRead 필터와 관계없이 전체 안 읽은 알림 수',
    }),
  })
  .meta({ id: 'NotificationList' });
