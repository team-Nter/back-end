import { ERROR_MESSAGE } from '#constants';
import { errorResponseSchema } from './schemas/common.schema.js';

// 쿠키(accessToken)로 인증이 필요한 API에 붙입니다.
export const AUTH = [{ cookieAuth: [] }];

export const json = (description, schema) => ({
  description,
  content: { 'application/json': { schema } },
});

export const noContent = (description = '성공 (응답 본문 없음)') => ({
  description,
});

/**
 * DTO 스키마는 그대로 두고, 문서에 표시할 필드별 예시 값만 덧붙입니다.
 * @example withExamples(loginSchema, { email: 'docthru@example.com' })
 */
export const withExamples = (schema, examples) =>
  schema.meta({
    override: ({ jsonSchema }) => {
      for (const [key, example] of Object.entries(examples)) {
        if (jsonSchema.properties?.[key]) {
          jsonSchema.properties[key].example = example;
        }
      }
    },
  });

// form 형식을 먼저 두면 Swagger UI가 필드별 입력칸을 기본으로 보여줍니다.
// examples를 넘기면 입력칸에 예시 값이 채워집니다.
export const body = (schema, { required = true, examples } = {}) => {
  const documented = examples ? withExamples(schema, examples) : schema;

  return {
    required,
    content: {
      'application/x-www-form-urlencoded': { schema: documented },
      'application/json': { schema: documented },
    },
  };
};

// 상태 코드만 넘겼을 때 쓰는 설명과, 서버가 실제로 보내는 메시지
const DEFAULT_ERRORS = {
  400: ['요청 값 검증 실패', ERROR_MESSAGE.INVALID_INPUT],
  401: ['로그인이 필요합니다.', ERROR_MESSAGE.UNAUTHORIZED],
  403: ['접근 권한이 없습니다.', ERROR_MESSAGE.FORBIDDEN],
  404: ['리소스를 찾을 수 없습니다.', ERROR_MESSAGE.RESOURCE_NOT_FOUND],
  409: [
    '현재 상태에서 처리할 수 없는 요청입니다.',
    ERROR_MESSAGE.RESOURCE_CONFLICT,
  ],
};

// 상태 코드마다 응답 예시의 message를 따로 보여줍니다.
const errorResponse = (description, message) => ({
  description,
  content: {
    'application/json': {
      schema: errorResponseSchema,
      example: { success: false, message },
    },
  },
});

/**
 * 에러 응답 묶음을 만듭니다.
 * 객체로 넘긴 설명은 응답 예시의 message로도 쓰입니다.
 * @example errors(400, 401, { 404: '챌린지를 찾을 수 없습니다.' })
 */
export const errors = (...entries) => {
  const result = {};

  for (const entry of entries) {
    if (typeof entry === 'number') {
      const [description, message] = DEFAULT_ERRORS[entry];
      result[entry] = errorResponse(description, message);
      continue;
    }

    for (const [status, description] of Object.entries(entry)) {
      result[status] = errorResponse(description, description);
    }
  }

  return result;
};
