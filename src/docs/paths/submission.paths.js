import { challengeIdParamSchema } from '../../controllers/challenge/dto/challenge.dto.js';
import {
  deleteSubmissionSchema,
  submissionParamsSchema,
  submissionSchema,
  updateSubmissionSchema,
} from '../../controllers/submission/dto/submission.dto.js';
import { submissionDraftSchema } from '../../controllers/submission-draft/dto/submission-draft.dto.js';
import { EXAMPLES } from '../examples.js';
import { AUTH, body, errors, json, noContent } from '../helpers.js';
import { pageQuerySchema } from '../schemas/common.schema.js';
import {
  createdSubmissionSchema,
  likeCountSchema,
  submissionDetailSchema,
  submissionDraftResponseSchema,
  submissionListSchema,
  submissionSchema as submissionResponseSchema,
} from '../schemas/submission.schema.js';

const tags = ['작업물'];
const draftTags = ['임시저장'];
const likeTags = ['좋아요'];

export const submissionPaths = {
  '/challenges/{challengeId}/submissions': {
    get: {
      tags,
      summary: '작업물 목록 조회',
      description: '좋아요 많은 순 → 먼저 제출한 순으로 정렬됩니다.',
      requestParams: {
        path: challengeIdParamSchema,
        query: pageQuerySchema(1),
      },
      responses: {
        200: json('조회 성공', submissionListSchema),
        ...errors(400, { 404: '챌린지를 찾을 수 없습니다.' }),
      },
    },
    post: {
      tags,
      summary: '작업물 제출',
      description:
        '진행 중인(승인 + 마감 전) 챌린지의 참여자만 1번 제출할 수 있습니다. 다른 참여자와 신청자에게 알림이 갑니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      requestBody: body(submissionSchema, {
        examples: EXAMPLES.createSubmission,
      }),
      responses: {
        201: json('제출 성공', createdSubmissionSchema),
        ...errors(400, 401, {
          403: '챌린지 참여자만 작업물을 제출할 수 있습니다.',
          404: '챌린지를 찾을 수 없습니다.',
          409: '제출할 수 없는 챌린지이거나 이미 제출했습니다.',
        }),
      },
    },
  },
  '/submission/{submissionId}': {
    get: {
      tags,
      summary: '작업물 상세 조회',
      security: AUTH,
      requestParams: { path: submissionParamsSchema },
      responses: {
        200: json('조회 성공', submissionDetailSchema),
        ...errors(400, 401, { 404: '작업물을 찾을 수 없습니다.' }),
      },
    },
    patch: {
      tags,
      summary: '작업물 수정',
      description:
        '작성자는 진행 중이고 선정되지 않은 작업물만 수정할 수 있습니다. 관리자는 언제나 수정할 수 있고, 이때 작성자에게 알림이 갑니다.',
      security: AUTH,
      requestParams: { path: submissionParamsSchema },
      requestBody: body(updateSubmissionSchema, {
        examples: EXAMPLES.updateSubmission,
      }),
      responses: {
        200: json('수정 성공', submissionResponseSchema),
        ...errors(400, 401, {
          403: '본인이 작성한 작업물만 수정할 수 있습니다.',
          404: '작업물 또는 챌린지를 찾을 수 없습니다.',
          409: '마감됐거나 진행 중이 아닌 챌린지, 또는 선정된 작업물입니다.',
        }),
      },
    },
    delete: {
      tags,
      summary: '작업물 삭제',
      description:
        '작성자 본인은 본문 없이 요청합니다. 관리자가 남의 작업물을 삭제할 때는 `reason`이 필수이며, 작성자에게 알림이 갑니다.',
      security: AUTH,
      requestParams: { path: submissionParamsSchema },
      requestBody: body(deleteSubmissionSchema.unwrap(), {
        required: false,
        examples: EXAMPLES.deleteSubmission,
      }),
      responses: {
        204: noContent('삭제 성공'),
        ...errors(401, {
          400: '관리자 삭제 시 사유 누락 또는 값 검증 실패',
          403: '본인이 작성한 작업물만 삭제할 수 있습니다.',
          404: '작업물 또는 챌린지를 찾을 수 없습니다.',
          409: '마감됐거나 진행 중이 아닌 챌린지, 또는 선정된 작업물입니다.',
        }),
      },
    },
  },
  '/submission/{submissionId}/like': {
    put: {
      tags: likeTags,
      summary: '좋아요 등록',
      description: '이미 좋아요한 상태에서 다시 요청해도 200으로 응답합니다.',
      security: AUTH,
      requestParams: { path: submissionParamsSchema },
      responses: {
        200: json('등록 성공', likeCountSchema),
        ...errors(400, 401, {
          404: '작업물 또는 챌린지를 찾을 수 없습니다.',
          409: '미승인 또는 마감된 챌린지입니다.',
        }),
      },
    },
    delete: {
      tags: likeTags,
      summary: '좋아요 취소',
      description: '좋아요하지 않은 상태에서 요청해도 200으로 응답합니다.',
      security: AUTH,
      requestParams: { path: submissionParamsSchema },
      responses: {
        200: json('취소 성공', likeCountSchema),
        ...errors(400, 401, {
          404: '작업물 또는 챌린지를 찾을 수 없습니다.',
          409: '미승인 또는 마감된 챌린지입니다.',
        }),
      },
    },
  },
  '/challenges/{challengeId}/draft': {
    get: {
      tags: draftTags,
      summary: '내 임시저장 조회',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      responses: {
        200: json(
          '조회 성공 (임시저장이 없으면 submissionDraft가 null)',
          submissionDraftResponseSchema,
        ),
        ...errors(400, 401, {
          404: '해당 챌린지의 참여를 확인할 수 없습니다.',
        }),
      },
    },
    put: {
      tags: draftTags,
      summary: '임시저장 생성·덮어쓰기',
      description:
        '제목과 내용 중 하나만 있어도 저장됩니다. 처음 저장할 때와 덮어쓸 때 모두 200으로 응답합니다.',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      requestBody: body(submissionDraftSchema, {
        examples: EXAMPLES.saveDraft,
      }),
      responses: {
        200: json('저장 성공', submissionDraftResponseSchema),
        ...errors(400, 401, {
          404: '챌린지 또는 참여 정보를 찾을 수 없습니다.',
          409: '저장할 수 없는 챌린지입니다. (미승인 또는 마감)',
        }),
      },
    },
    delete: {
      tags: draftTags,
      summary: '내 임시저장 삭제',
      security: AUTH,
      requestParams: { path: challengeIdParamSchema },
      responses: {
        204: noContent('삭제 성공'),
        ...errors(400, 401, {
          404: '챌린지 또는 참여 정보를 찾을 수 없습니다.',
          409: '삭제할 수 없는 챌린지입니다. (미승인 또는 마감)',
        }),
      },
    },
  },
};
