import { z } from 'zod';
import { CHALLENGE_CATEGORIES, DOCUMENT_TYPES } from '#constants';

export const createChallengeSchema = z.object({
  title: z
    .string({ error: '제목은 필수입니다.' })
    .trim()
    .min(1, '제목은 1자 이상이어야 합니다.')
    .max(30, '제목은 30자 이하여야 합니다.'),
  sourceUrl: z.url({
    protocol: /^https?$/,
    error: 'http 또는 https로 시작하는 원문 링크를 입력해주세요.',
  }),

  category: z.enum(CHALLENGE_CATEGORIES, { error: '분야를 선택해주세요.' }),

  documentType: z.enum(DOCUMENT_TYPES, { error: '문서 타입을 선택해주세요.' }),

  deadlineAt: z.iso
    .datetime({ offset: true, error: '마감일 형식이 올바르지 않습니다.' })
    .refine((value) => new Date(value) > new Date(), {
      message: '마감일은 오늘보다 작을 수 없습니다.',
    }),

  maxParticipants: z.coerce
    .number({ error: '최대 인원은 숫자여야 합니다.' })
    .int('최대 인원은 정수여야 합니다.')
    .min(1, '최대 인원은 1명 이상이어야 합니다.')
    .max(100, '최대 인원은 100명 이하여야 합니다.'),

  description: z
    .string({ error: '내용입력은 필수입니다.' })
    .trim()
    .min(1, '내용은 1자 이상이어야 합니다')
    .max(255, '내용은 255자 이하여야합니다.'),
});

export const challengeIdParamSchema = z.object({
  challengeId: z.coerce.number().int().positive('챌린지 ID는 양수여야 합니다.'),
});

export const updateChallengeSchema = createChallengeSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: '수정할 내용이 없습니다.',
  });

export const myChallengeListQuerySchema = z.object({
  type: z.enum(['requested', 'participating', 'completed'], {
    error: 'type은 requested, participating, completed 중 하나여야 합니다.',
  }),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  keyword: z.string().trim().optional(),
});
