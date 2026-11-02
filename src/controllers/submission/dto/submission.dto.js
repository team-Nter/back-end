import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const submissionSchema = z.object({
  // TODO: 인증·참여 기능 연결 후 서버에서 참여 ID를 조회하도록 변경
  participationId: z.number().int().positive(),
  title: z
    .string({ error: '제목은 필수입니다.' })
    .trim()
    .min(1, '제목은 필수입니다.')
    .max(30, '제목은 30자 이하여야 합니다.'),
  content: z
    .string({ error: '내용은 필수입니다.' })
    .refine((content) => content.trim().length > 0, '내용은 필수입니다.'),
});

export const updateSubmissionSchema = submissionSchema
  .pick({ title: true, content: true })
  .partial()
  .refine((v) => v.title !== undefined || v.content !== undefined, {
    message: '수정할 내용이 필요합니다.',
  });

export const submissionParamsSchema = z.object({ submissionId: idSchema });
