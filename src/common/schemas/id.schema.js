import { z } from 'zod';

// int 4범위 십진수 단위 검증
export const idSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'ID는 양의 십진 정수여야 합니다.')
  .transform(Number)
  .refine((id) => id <= 2147483647, {
    message: 'ID가 허용 범위를 초과했습니다.',
  });
