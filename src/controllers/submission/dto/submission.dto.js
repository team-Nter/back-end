import { z } from 'zod';
import { idSchema } from '../../../common/schemas/id.schema.js';

export const submissionSchema = z.object({
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

// 본인 삭제는 body 없이 요청하므로 body 자체가 없어도 통과시킵니다.
// 관리자가 남의 작업물을 삭제할 때 사유가 필요한지는 서비스에서 확인합니다.
export const deleteSubmissionSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(1, '삭제 사유를 입력해주세요.')
      .max(255, '삭제 사유는 255자 이하여야 합니다.')
      .optional(),
  })
  .optional();

export const submissionParamsSchema = z.object({ submissionId: idSchema });
