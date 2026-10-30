import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const createFeedbackSchema = z.object({
  content: z
    .string({ error: '피드백 내용은 필수입니다.' })
    .trim()
    .min(1, '피드백 내용은 필수입니다.'),
});

export const feedbackParamsSchema = z.object({
  feedbackId: idSchema,
});
