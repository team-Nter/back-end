import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const createFeedbackSchema = z.object({
  content: z
    .string({ error: '피드백 내용은 필수입니다.' })
    .trim()
    .min(1, '피드백 내용은 필수입니다.')
    .max(4000, '피드백은 4000자 이내로 입력해 주세요.'),
});

// 본인 삭제는 body 없이 요청하므로 body 자체가 없어도 통과시켜야함
// 관리자가 남의 피드백을 삭제할 때 사유가 필요한지는 서비스에서 확인
export const deleteFeedbackSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(1, '삭제 사유를 입력해주세요.')
      .max(255, '삭제 사유는 255자 이하여야 합니다.')
      .optional(),
  })
  .optional();

export const feedbackParamsSchema = z.object({
  feedbackId: idSchema,
});
