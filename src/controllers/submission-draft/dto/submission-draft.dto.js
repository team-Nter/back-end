import { z } from 'zod';

// 둘 중 하나만 채워져 있어도 진행되는 구조
export const submissionDraftSchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(30, '제목은 30자 이하여야 합니다.')
      .default(''),
    content: z.string().default(''),
  })
  .refine(
    ({ title, content }) => title.length > 0 || content.trim().length > 0,
    {
      message: '제목 또는 내용을 입력해주세요.',
      path: ['content'],
    },
  );
