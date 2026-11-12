import { z } from 'zod';
import {
  adminChallengeDetailQuerySchema,
  adminChallengeListQuerySchema,
  challengeIdParamSchema,
  challengeListQuerySchema,
  createChallengeSchema,
  updateChallengeSchema,
} from '../../controllers/challenge/dto/challenge.dto.js';
import { moderateChallengeSchema } from '../../controllers/moderation-log/dto/moderation-log.dto.js';
import { EXAMPLES } from '../examples.js';
import { AUTH, body, errors, json, noContent } from '../helpers.js';
import {
  adminChallengeDetailSchema,
  challengeDetailSchema,
  challengeListSchema,
  challengeSchema,
  moderationResultSchema,
} from '../schemas/challenge.schema.js';

const tags = ['챌린지'];
const adminTags = ['챌린지 관리 (관리자)'];

const keyword = z.string().optional().meta({ description: '제목 검색어' });

const challengeListQuery = challengeListQuerySchema.extend({
  category: z.string().optional().meta({
    description: '쉼표로 여러 개 지정 (예: NEXTJS,API)',
    example: 'NEXTJS,API',
  }),
  progress: challengeListQuerySchema.shape.progress.meta({
    description: 'open: 마감 전 / closed: 마감됨',
  }),
  keyword,
});

const adminStatus = z.string().optional().meta({
  description: '쉼표로 여러 개 지정 (예: PENDING,REJECTED). 생략하면 전체',
  example: 'PENDING,REJECTED',
});

const adminListQuery = adminChallengeListQuerySchema.extend({
  status: adminStatus,
  keyword,
});

const adminDetailQuery = adminChallengeDetailQuerySchema.extend({
  status: adminStatus,
  keyword,
});

export const challengePaths = {
  '/challenges': {
    get: {
      tags,
      summary: '챌린지 목록 조회',
      description: '승인(APPROVED)된 챌린지만 조회됩니다.',
      requestParams: { query: challengeListQuery },
      responses: {
        200: json('조회 성공', challengeListSchema),
        ...errors(400),
      },
    },
    post: {
      tags,
      summary: '챌린지 신청',
      description: '신청한 챌린지는 PENDING 상태로 생성됩니다.',
      security: AUTH,
      requestBody: body(createChallengeSchema, {
        examples: EXAMPLES.createChallenge,
      }),
      responses: {
        201: json('신청 성공', challengeSchema),
        ...errors(400, 401),
      },
    },
  },
  '/challenges/{challengeId}': {
    get: {
      tags,
      summary: '챌린지 상세 조회',
      description:
        '승인된 챌린지만 조회됩니다. 로그인하면 내 참여·제출 정보가 함께 내려갑니다.',
      requestParams: { path: challengeIdParamSchema },
      responses: {
        200: json('조회 성공', challengeDetailSchema),
        ...errors(400, { 404: '챌린지가 없거나 승인되지 않았습니다.' }),
      },
    },
    patch: {
      tags,
      summary: '내가 신청한 챌린지 수정',
      description:
        'PENDING·REJECTED 상태에서만 수정할 수 있고, 수정하면 PENDING으로 돌아갑니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      requestBody: body(updateChallengeSchema, {
        examples: EXAMPLES.updateChallenge,
      }),
      responses: {
        200: json('수정 성공', challengeSchema),
        ...errors(400, 401, {
          403: '본인이 신청한 챌린지만 수정할 수 있습니다.',
          404: '챌린지를 찾을 수 없습니다.',
          409: '승인 대기 중이거나 거절된 챌린지만 수정할 수 있습니다.',
        }),
      },
    },
    delete: {
      tags,
      summary: '내가 신청한 챌린지 취소 (삭제)',
      description:
        'PENDING·REJECTED 상태이고 참여·제출 이력이 없을 때만 삭제됩니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      responses: {
        204: noContent('삭제 성공'),
        ...errors(400, 401, {
          403: '본인이 신청한 챌린지만 취소할 수 있습니다.',
          404: '챌린지를 찾을 수 없습니다.',
          409: '취소할 수 없는 상태이거나 참여 이력이 있습니다.',
        }),
      },
    },
  },
  '/challenges/admin': {
    get: {
      tags: adminTags,
      summary: '관리자 챌린지 목록 조회',
      description: '모든 상태의 챌린지를 조회합니다.',
      security: AUTH,
      requestParams: { query: adminListQuery },
      responses: {
        200: json('조회 성공', challengeListSchema),
        ...errors(400, 401, 403),
      },
    },
  },
  '/challenges/admin/{challengeId}': {
    get: {
      tags: adminTags,
      summary: '관리자 챌린지 상세 조회',
      description:
        '목록과 같은 필터·정렬을 Query로 넘기면 이전/다음 챌린지 ID(prevId, nextId)를 계산해 줍니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema, query: adminDetailQuery },
      responses: {
        200: json('조회 성공', adminChallengeDetailSchema),
        ...errors(400, 401, 403, { 404: '챌린지를 찾을 수 없습니다.' }),
      },
    },
  },
  '/challenges/{challengeId}/moderation-logs': {
    post: {
      tags: adminTags,
      summary: '챌린지 승인·거절·취소',
      description: [
        ' APPROVE: PENDING → APPROVED (마감된 챌린지는 승인 불가)\n',
        ' REJECT: PENDING → REJECTED (사유 필수)\n',
        ' CANCEL: APPROVED → CANCELED (사유 필수, 참여자에게도 알림)',
        '',
        '처리 결과는 신청자에게 알림으로 전송됩니다.',
      ].join('\n'),
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      requestBody: body(moderateChallengeSchema, {
        examples: EXAMPLES.moderateChallenge,
      }),
      responses: {
        200: json('처리 성공', moderationResultSchema),
        ...errors(400, 401, 403, {
          404: '챌린지를 찾을 수 없습니다.',
          409: '현재 상태에서는 처리할 수 없거나 마감된 챌린지입니다.',
        }),
      },
    },
  },
};
