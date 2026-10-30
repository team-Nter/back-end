import { z } from 'zod';

export const createFeedbackSchema = z.object({
  content: z
    .string({ error: '피드백 내용은 필수입니다.' })
    .trim()
    .min(1, '피드백 내용은 필수입니다.'),
});
