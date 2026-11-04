import { z } from 'zod';

export const challengeIdParamSchema = z.object({
  challengeId: z.coerce.number().int().positive({
    message: '챌린지 ID는 양수여야 합니다.',
  }),
});

export const participantListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
