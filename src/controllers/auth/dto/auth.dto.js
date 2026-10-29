import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.email('유효한 이메일 형식이 아닙니다.'),
  password: z
    .string({ error: '비밀번호는 필수입니다.' })
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(24, '비밀번호는 24자 이하여야 합니다.'),
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(16, '닉네임은 16자 이하여야 합니다.'),
});

export const loginSchema = z.object({
  email: z.email('유효한 이메일 형식이 아닙니다.'),
  password: z
    .string({ error: '비밀번호는 필수입니다.' })
    .min(1, '비밀번호를 입력해주세요.')
    .max(24, '비밀번호는 24자 이하여야 합니다.'),
});
