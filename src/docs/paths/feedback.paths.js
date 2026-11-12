import {
  createFeedbackSchema,
  deleteFeedbackSchema,
  feedbackParamsSchema,
} from '../../controllers/feedback/dto/feedback.dto.js';
import { submissionParamsSchema } from '../../controllers/submission/dto/submission.dto.js';
import { EXAMPLES } from '../examples.js';
import { AUTH, body, errors, json, noContent } from '../helpers.js';
import { pageQuerySchema } from '../schemas/common.schema.js';
import {
  feedbackListSchema,
  feedbackSchema,
} from '../schemas/feedback.schema.js';

const tags = ['피드백'];

export const feedbackPaths = {
  '/submission/{submissionId}/feedbacks': {
    get: {
      tags,
      summary: '피드백 목록 조회',
      description: '최신순으로 정렬됩니다.',
      requestParams: {
        path: submissionParamsSchema,
        query: pageQuerySchema(10),
      },
      responses: {
        200: json('조회 성공', feedbackListSchema),
        ...errors(400, { 404: '제출물을 찾을 수 없습니다.' }),
      },
    },
    post: {
      tags,
      summary: '피드백 작성',
      description: '승인된 챌린지의 작업물에만 작성할 수 있습니다.',
      security: AUTH,
      requestParams: { path: submissionParamsSchema },
      requestBody: body(createFeedbackSchema, { examples: EXAMPLES.feedback }),
      responses: {
        201: json('작성 성공', feedbackSchema),
        ...errors(400, 401, {
          404: '제출물 또는 챌린지를 찾을 수 없습니다.',
          409: '승인된 챌린지의 제출물에만 피드백을 작성할 수 있습니다.',
        }),
      },
    },
  },
  '/feedback/{feedbackId}': {
    patch: {
      tags,
      summary: '피드백 수정',
      description: '작성자 본인 또는 관리자만 수정할 수 있습니다.',
      security: AUTH,
      requestParams: { path: feedbackParamsSchema },
      requestBody: body(createFeedbackSchema, { examples: EXAMPLES.feedback }),
      responses: {
        200: json('수정 성공', feedbackSchema),
        ...errors(400, 401, {
          403: '본인이 작성한 피드백만 수정할 수 있습니다.',
          404: '피드백, 제출물 또는 챌린지를 찾을 수 없습니다.',
          409: '승인된 챌린지의 피드백만 수정할 수 있습니다.',
        }),
      },
    },
    delete: {
      tags,
      summary: '피드백 삭제',
      description: '작성자 본인 또는 관리자만 삭제할 수 있습니다.',
      security: AUTH,
      requestParams: { path: feedbackParamsSchema },
      requestBody: {
        required: false,
        content: {
          'application/json': { schema: deleteFeedbackSchema.unwrap() },
        },
      },
      responses: {
        204: noContent('삭제 성공'),
        ...errors(400, 401, {
          403: '본인이 작성한 피드백만 삭제할 수 있습니다.',
          404: '피드백, 제출물 또는 챌린지를 찾을 수 없습니다.',
          409: '승인된 챌린지의 피드백만 삭제할 수 있습니다.',
        }),
      },
    },
  },
};
