import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const createFeedbackSchema = z.object({
  content: z
    .string({ error: '피드백 내용은 필수입니다.' })
    .trim()
    .min(1, '피드백 내용은 필수입니다.')
    .max(4000, '피드백은 4000자 이내로 입력해 주세요.'),
});

export const feedbackParamsSchema = z.object({
  feedbackId: idSchema,
});
