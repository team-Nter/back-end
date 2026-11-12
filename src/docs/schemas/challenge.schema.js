import { z } from 'zod';
import {
  CHALLENGE_CATEGORIES,
  CHALLENGE_STATUSES,
  DOCUMENT_TYPES,
} from '#constants';
import {
  authorSchema,
  dateTime,
  id,
  nickname,
  paginated,
} from './common.schema.js';

const challengeStatus = z
  .enum(CHALLENGE_STATUSES)
  .meta({ example: 'APPROVED' });

const moderationAction = z
  .enum(['APPROVE', 'REJECT', 'CANCEL', 'DELETE'])
  .meta({ example: 'REJECT' });

const moderationReason = z
  .string()
  .nullable()
  .meta({ example: '원문 링크가 올바르지 않습니다.' });

export const challengeSchema = z
  .object({
    id: id(3),
    requestorId: id(1).nullable(),
    title: z.string().meta({ example: 'Next.js App Router 공식 문서 번역' }),
    sourceUrl: z.url().meta({ example: 'https://nextjs.org/docs/app' }),
    description: z
      .string()
      .nullable()
      .meta({ example: 'App Router 라우팅 문서를 함께 번역해요.' }),
    category: z.enum(CHALLENGE_CATEGORIES).meta({ example: 'NEXTJS' }),
    documentType: z.enum(DOCUMENT_TYPES).meta({ example: 'OFFICIAL_DOCUMENT' }),
    deadlineAt: dateTime.meta({ example: '2026-12-31T14:59:59.000Z' }),
    maxParticipants: id(10),
    status: challengeStatus,
    createdAt: dateTime,
    updatedAt: dateTime,
  })
  .meta({ id: 'Challenge' });

const requestorSchema = z
  .object({ id: id(1), nickname })
  .nullable()
  .meta({ description: '신청자가 탈퇴했으면 null' });

export const challengeListItemSchema = challengeSchema
  .extend({
    requestor: requestorSchema,
    participations: id(4).meta({ description: '참여자 수' }),
  })
  .meta({ id: 'ChallengeListItem' });

export const challengeListSchema = paginated(
  challengeListItemSchema,
  'ChallengeList',
);

export const myChallengeListItemSchema = challengeListItemSchema
  .extend({
    mySubmissionId: id(8).nullable().optional().meta({
      description:
        'type이 participating·completed일 때만 포함됩니다. 미제출이면 null',
    }),
  })
  .meta({ id: 'MyChallengeListItem' });

export const myChallengeListSchema = paginated(
  myChallengeListItemSchema,
  'MyChallengeList',
);

const challengeWithCountsSchema = challengeListItemSchema.extend({
  submissions: id(2).meta({ description: '제출된 작업물 수' }),
});

const latestModerationSchema = z
  .object({
    action: moderationAction,
    reason: moderationReason,
    createdAt: dateTime,
  })
  .nullable()
  .meta({
    id: 'LatestModeration',
    description: '거절·취소된 챌린지일 때 가장 최근 처리 기록, 그 외에는 null',
  });

export const bestSubmissionSchema = z
  .object({
    id: id(8),
    content: z.string().meta({
      example:
        '## 라우팅\n\nApp Router는 React 서버 컴포넌트를 기반으로 합니다.',
    }),
    likeCount: id(7),
    submittedAt: dateTime.nullable(),
    author: authorSchema.nullable(),
  })
  .meta({ id: 'BestSubmission' });

export const challengeDetailSchema = challengeWithCountsSchema
  .extend({
    myParticipation: z
      .object({ id: id(5) })
      .nullable()
      .meta({ description: '로그인 + 참여 중일 때만 값이 있습니다.' }),
    mySubmissionId: id(8).nullable(),
    bestSubmissions: z.array(bestSubmissionSchema).meta({
      description: '마감된 챌린지에서만 채워집니다. 좋아요가 가장 많은 작업물',
    }),
  })
  .meta({ id: 'ChallengeDetail' });

export const myChallengeDetailSchema = challengeWithCountsSchema
  .extend({
    canEdit: z
      .boolean()
      .meta({ example: false, description: 'PENDING·REJECTED이면 true' }),
    canCancel: z.boolean().meta({
      example: false,
      description: 'PENDING·REJECTED이면서 참여·제출 이력이 없으면 true',
    }),
    moderation: latestModerationSchema,
  })
  .meta({ id: 'MyChallengeDetail' });

export const adminChallengeDetailSchema = challengeWithCountsSchema
  .extend({
    prevId: id(2).nullable(),
    nextId: id(4).nullable(),
    moderation: latestModerationSchema,
  })
  .meta({ id: 'AdminChallengeDetail' });

export const moderationResultSchema = z
  .object({
    challengeId: id(3),
    status: challengeStatus.meta({ example: 'REJECTED' }),
    moderation: z.object({
      id: id(6),
      action: moderationAction,
      reason: moderationReason,
      adminId: id(99),
      createdAt: dateTime,
    }),
    updatedAt: dateTime,
  })
  .meta({ id: 'ModerationResult' });
