import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const participationParamsSchema = z.object({
  challengeId: idSchema,
  userId: idSchema,
});

export const challengeIdParamSchema = z.object({
  challengeId: idSchema,
});

export const participantListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
