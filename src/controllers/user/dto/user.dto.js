import { z } from 'zod';

// 사용자 ID 파라미터 검증 스키마
export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive({
    message: '사용자 ID는 양수여야 합니다.',
  }),
});

// 사용자 생성 스키마
export const createUserSchema = z.object({
  email: z.email('유효한 이메일 형식이 아닙니다.').toLowerCase(),
  password: z
    .string({ error: '비밀번호는 필수입니다.' })
    .min(4, '비밀번호는 4자 이상이어야 합니다.')
    .max(24, '비밀번호는 24자 이하여야 합니다.'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.').optional(),
});
