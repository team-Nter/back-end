import {
  challengeIdParamSchema,
  myChallengeListQuerySchema,
} from '../../controllers/challenge/dto/challenge.dto.js';
import {
  myNotificationListQuerySchema,
  notificationIdParamSchema,
} from '../../controllers/user/dto/notification.dto.js';
import { userIdParamSchema } from '../../controllers/user/dto/user.dto.js';
import { AUTH, errors, json, noContent } from '../helpers.js';
import {
  myChallengeDetailSchema,
  myChallengeListSchema,
} from '../schemas/challenge.schema.js';
import {
  notificationListSchema,
  publicUserSchema,
} from '../schemas/user.schema.js';

export const userPaths = {
  '/users/{userId}': {
    get: {
      tags: ['사용자'],
      summary: '사용자 공개 정보 조회',
      requestParams: { path: userIdParamSchema },
      responses: {
        200: json('조회 성공', publicUserSchema),
        ...errors(400, { 404: '사용자를 찾을 수 없습니다.' }),
      },
    },
  },
  '/users/me/challenges': {
    get: {
      tags: ['사용자'],
      summary: '내 챌린지 목록 조회',
      security: AUTH,
      requestParams: { query: myChallengeListQuerySchema },
      responses: {
        200: json('조회 성공', myChallengeListSchema),
        ...errors(400, 401),
      },
    },
  },
  '/users/me/challenges/{challengeId}': {
    get: {
      tags: ['사용자'],
      summary: '내가 신청한 챌린지 상세 조회',
      description:
        '본인이 신청한 챌린지만 조회할 수 있습니다. 승인 전 상태도 조회됩니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      responses: {
        200: json('조회 성공', myChallengeDetailSchema),
        ...errors(400, 401, {
          404: '챌린지가 없거나 본인이 신청한 챌린지가 아닙니다.',
        }),
      },
    },
  },
  '/users/me/notifications': {
    get: {
      tags: ['알림'],
      summary: '내 알림 목록 조회',
      description: '최신순으로 정렬됩니다.',
      security: AUTH,
      requestParams: { query: myNotificationListQuerySchema },
      responses: {
        200: json('조회 성공', notificationListSchema),
        ...errors(400, 401),
      },
    },
  },
  '/users/me/notifications/read-all': {
    patch: {
      tags: ['알림'],
      summary: '알림 전체 읽음 처리',
      security: AUTH,
      responses: { 204: noContent('처리 성공'), ...errors(401) },
    },
  },
  '/users/me/notifications/{notificationId}/read': {
    patch: {
      tags: ['알림'],
      summary: '알림 개별 읽음 처리',
      description: '이미 읽은 알림이어도 204로 응답합니다.',
      security: AUTH,
      requestParams: { path: notificationIdParamSchema },
      responses: {
        204: noContent('처리 성공'),
        ...errors(400, 401, { 404: '알림을 찾을 수 없습니다.' }),
      },
    },
  },
};
