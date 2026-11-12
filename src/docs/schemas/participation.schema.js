import { z } from 'zod';
import { authorSchema, dateTime, id, paginated } from './common.schema.js';

export const participationSchema = z
  .object({
    id: id(5),
    challengeId: id(3),
    userId: id(1).nullable(),
    joinedAt: dateTime,
  })
  .meta({ id: 'Participation' });

export const participantListItemSchema = z
  .object({
    id: id(5).meta({ description: '참여 ID' }),
    user: authorSchema.nullable(),
    submissionId: id(8).nullable().meta({ description: '미제출이면 null' }),
    likeCount: id(7),
    submittedAt: dateTime.nullable(),
    joinedAt: dateTime,
    rank: id(1).nullable().meta({
      description: '좋아요 기준 공동 순위 (1, 1, 1, 4 방식). 미제출자는 null',
    }),
  })
  .meta({ id: 'ParticipantListItem' });

export const participantListSchema = paginated(
  participantListItemSchema,
  'ParticipantList',
);

export const participantDetailSchema = participationSchema
  .extend({
    user: authorSchema.nullable(),
    submission: z.object({ id: id(8) }).nullable(),
  })
  .meta({ id: 'ParticipantDetail' });
