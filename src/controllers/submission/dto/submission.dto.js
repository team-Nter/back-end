import { z } from 'zod';

export const submissionSchema = z.object({
  title: z.string(
    { error: '제목은 필수입니다.' }.max(30, '제목은 30자 이하여야 합니다.'),
  ),
  content: z.string({ error: '내용은 필수입니다.' }),
});
