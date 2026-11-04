import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const participationParamsSchema = z.object({
  challengeId: idSchema,
  userId: idSchema,
});

export const challengeIdParamSchema = z.object({
  challengeId: z.coerce.number().int().positive({
    message: '챌린지 ID는 양수여야 합니다.',
  }),
});
