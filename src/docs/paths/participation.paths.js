import {
  challengeIdParamSchema,
  participantListQuerySchema,
  participationParamsSchema,
} from '../../controllers/participation/dto/participation.dto.js';
import { AUTH, errors, json, noContent } from '../helpers.js';
import {
  participantDetailSchema,
  participantListSchema,
  participationSchema,
} from '../schemas/participation.schema.js';

const tags = ['참여'];

export const participationPaths = {
  '/challenges/{challengeId}/participants': {
    get: {
      tags,
      summary: '참여 현황 조회',
      description:
        '제출자(좋아요 많은 순 → 먼저 제출한 순) 다음, 미제출자(먼저 참여한 순)으로 조회합니다.',
      requestParams: {
        path: challengeIdParamSchema,
        query: participantListQuerySchema,
      },
      responses: {
        200: json('조회 성공', participantListSchema),
        ...errors(400, { 404: '챌린지가 없거나 승인되지 않았습니다.' }),
      },
    },
    post: {
      tags,
      summary: '챌린지 참여',
      description: '일반 사용자(USER)만 참여할 수 있습니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      responses: {
        201: json('참여 성공', participationSchema),
        ...errors(400, 401, {
          403: '관리자는 참여할 수 없습니다.',
          404: '챌린지를 찾을 수 없습니다.',
          409: '승인 전·마감·정원 초과이거나 이미 참여 중입니다.',
        }),
      },
    },
  },
  '/challenges/{challengeId}/participants/me': {
    delete: {
      tags,
      summary: '내 참여 취소',
      description: '마감 전에만 취소할 수 있습니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      responses: {
        204: noContent('취소 성공'),
        ...errors(400, 401, {
          404: '챌린지가 없거나 참여한 적이 없습니다.',
          409: '이미 마감된 챌린지입니다.',
        }),
      },
    },
  },
  '/challenges/{challengeId}/participants/{userId}': {
    get: {
      tags,
      summary: '특정 사용자의 참여 정보 조회',
      requestParams: { path: participationParamsSchema },
      responses: {
        200: json('조회 성공', participantDetailSchema),
        ...errors(400, {
          404: '챌린지가 없거나 승인되지 않았거나, 참여 기록이 없습니다.',
        }),
      },
    },
  },
};
