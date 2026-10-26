// 데이터베이스 에러 코드 상수
export const DB_ERROR = {
  UNIQUE_VIOLATION: '23505',
};

// 에러 메시지 상수
export const ERROR_MESSAGE = {
  // User 관련
  USER_NOT_FOUND: '유저를 찾을 수 없습니다.',
  EMAIL_REQUIRED: '이메일은 필수입니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  FAILED_TO_FETCH_USERS: '유저 목록을 불러오지 못했습니다.',
  FAILED_TO_FETCH_USER: '유저 정보를 불러오지 못했습니다.',
  FAILED_TO_CREATE_USER: '유저를 생성하지 못했습니다.',
  FAILED_TO_UPDATE_USER: '유저 정보를 수정하지 못했습니다.',
  FAILED_TO_DELETE_USER: '유저를 삭제하지 못했습니다.',

  // Auth 관련
  NO_AUTH_TOKEN: '인증 토큰이 없습니다.',
  INVALID_TOKEN: '유효하지 않거나 만료된 토큰입니다.',
  USER_NOT_FOUND_FROM_TOKEN: '토큰에 해당하는 유저를 찾을 수 없습니다.',
  AUTH_FAILED: '인증에 실패했습니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  INVALID_SOCIAL_AUTH_STATE: '유효하지 않거나 만료된 소셜 로그인 state입니다.',
  SOCIAL_ACCOUNT_LINK_REQUIRED:
    '이 소셜 계정을 연결하려면 먼저 기존 계정으로 로그인해야 합니다.',
  SOCIAL_AUTH_FAILED: '소셜 로그인에 실패했습니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',

  // Validation
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
  VALIDATION_FAILED: '입력값 검증에 실패했습니다.',

  // 일반 에러 (Exception 기본값으로 사용)
  RESOURCE_NOT_FOUND: '리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  RESOURCE_CONFLICT: '이미 존재하는 리소스입니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
};

export const EXIT_CODE = {
  SUCCESS: 0,
  FAILURE: 1,
};
