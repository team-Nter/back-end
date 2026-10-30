import { z } from 'zod';

export const challengeIdParamSchema = z.object({
  challengeId: z.coerce.number().int().positive({
    message: '챌린지 ID는 양수여야 합니다.',
  }),
});
