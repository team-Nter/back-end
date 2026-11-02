import { z } from 'zod';
import { MODERATION_ACTION } from '#constants';

export const moderateChallengeSchema = z
  .object({
    action: z.enum(MODERATION_ACTION, {
      error: 'action은 APPROVE, REJECT, CANCEL 중 하나여야 합니다.',
    }),
    reason: z
      .string()
      .trim()
      .min(1, '사유를 입력해주세요.')
      .max(255, '사유는 255자 이하여야 합니다.')
      .optional(),
  })
  .refine((data) => data.action === 'APPROVE' || data.reason, {
    message: '거절 취소 시 사유는 필수입니다.',
    path: ['reason'],
  });
