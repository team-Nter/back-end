import { z } from 'zod';
import { authorSchema, dateTime, id, paginated } from './common.schema.js';

export const feedbackSchema = z
  .object({
    id: id(21),
    submissionId: id(8),
    content: z.string().meta({
      example:
        '번역이 자연스러워요! 다만 "hydration"은 원문 그대로 두는 게 좋겠어요.',
    }),
    createdAt: dateTime,
    updatedAt: dateTime,
    author: authorSchema.nullable(),
  })
  .meta({ id: 'Feedback' });

export const feedbackListSchema = paginated(feedbackSchema, 'FeedbackList');
