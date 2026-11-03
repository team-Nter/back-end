import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const myNotificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .enum(['true', 'false'], {
      error: 'isRead는 true 또는 false여야 합니다.',
    })
    .transform((value) => value === 'true')
    .optional(),
});

export const notificationIdParamSchema = z.object({
  notificationId: idSchema,
});
