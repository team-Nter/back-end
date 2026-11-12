import { z } from 'zod';

// 예시 값을 붙인 공통 필드
export const id = (example = 1) => z.number().int().meta({ example });

export const dateTime = z.iso
  .datetime({ offset: true })
  .meta({ example: '2026-11-12T09:00:00.000Z' });

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string().meta({ example: '입력값이 올바르지 않습니다.' }),
  })
  .meta({
    id: 'ErrorResponse',
    description:
      '모든 에러는 이 형태로 응답합니다. 처리되지 않은 서버 오류는 500으로 응답합니다.',
  });

export const paginationSchema = z
  .object({
    page: id(1),
    pageSize: id(10),
    totalCount: id(42),
    totalPages: id(5),
  })
  .meta({ id: 'Pagination' });

export const paginated = (itemSchema, schemaId) =>
  z
    .object({
      items: z.array(itemSchema),
      pagination: paginationSchema,
    })
    .meta({ id: schemaId });

export const userGradeSchema = z
  .enum(['EXPERT', 'NORMAL'])
  .meta({ example: 'NORMAL' });

export const nickname = z.string().nullable().meta({ example: '독스루' });

export const authorSchema = z
  .object({
    id: id(1),
    nickname,
    grade: userGradeSchema,
  })
  .meta({ id: 'Author', description: '탈퇴한 사용자는 null로 내려갑니다.' });

// 서버가 직접 검증하지 않는 목록 Query (작업물·피드백 목록)
export const pageQuerySchema = (defaultPageSize) =>
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(defaultPageSize),
  });
