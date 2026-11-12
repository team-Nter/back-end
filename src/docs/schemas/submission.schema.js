import { z } from 'zod';
import { authorSchema, dateTime, id, paginated } from './common.schema.js';

const title = z.string().meta({ example: 'App Router 라우팅 문서 번역본' });
const content = z.string().meta({
  example: '## 라우팅\n\nApp Router는 React 서버 컴포넌트를 기반으로 합니다.',
});
const isSelected = z
  .boolean()
  .meta({ example: false, description: '최다 추천 작업물로 선정됐는지' });

export const submissionSchema = z
  .object({
    id: id(8),
    challengeId: id(3),
    title,
    content,
    isSelected,
    createdAt: dateTime,
    updatedAt: dateTime,
    submittedAt: dateTime.nullable(),
  })
  .meta({ id: 'Submission' });

export const submissionListItemSchema = z
  .object({
    id: id(8),
    challengeId: id(3),
    title,
    isSelected,
    createdAt: dateTime,
    updatedAt: dateTime,
    author: authorSchema.nullable(),
    likeCount: id(7),
    feedbackCount: id(3),
  })
  .meta({ id: 'SubmissionListItem' });

export const submissionListSchema = paginated(
  submissionListItemSchema,
  'SubmissionList',
);

export const submissionDetailSchema = submissionSchema
  .extend({
    likeCount: id(7),
    isLiked: z
      .boolean()
      .meta({ example: true, description: '내가 좋아요를 눌렀는지' }),
    feedbackCount: id(3),
    author: authorSchema.nullable(),
  })
  .meta({ id: 'SubmissionDetail' });

export const createdSubmissionSchema = submissionSchema
  .extend({ author: authorSchema.nullable() })
  .meta({ id: 'CreatedSubmission' });

export const likeCountSchema = z
  .object({ likeCount: id(8).meta({ description: '처리 후 좋아요 수' }) })
  .meta({ id: 'LikeCount' });

const submissionDraftSchema = z
  .object({
    id: id(2),
    title: title.nullable(),
    content,
    createdAt: dateTime,
    updatedAt: dateTime,
  })
  .meta({ id: 'SubmissionDraft' });

export const submissionDraftResponseSchema = z
  .object({
    challengeId: id(3),
    submissionDraft: submissionDraftSchema
      .nullable()
      .meta({ description: '임시저장이 없으면 null' }),
  })
  .meta({ id: 'SubmissionDraftResponse' });
