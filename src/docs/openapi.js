import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import { config, isProduction } from '#config';
import { json } from './helpers.js';
import { authPaths } from './paths/auth.paths.js';
import { challengePaths } from './paths/challenge.paths.js';
import { feedbackPaths } from './paths/feedback.paths.js';
import { participationPaths } from './paths/participation.paths.js';
import { submissionPaths } from './paths/submission.paths.js';
import { userPaths } from './paths/user.paths.js';

const systemPaths = {
  '/ping': {
    get: {
      tags: ['시스템'],
      summary: '서버 상태 확인',
      responses: {
        200: json(
          '서버 정상',
          z.object({
            message: z
              .string()
              .meta({ example: '현재 시간: 2026-11-11 12:00:00' }),
          }),
        ),
      },
    },
  },
};

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: '독스루 API',
    version: '1.0.0',
    description: [
      '개발 문서 번역 챌린지 서비스 독스루 API입니다.',
      '',
      '### 로그인이 필요한 API를 쓰려면',
      '',
      '1. 아래 **인증 → `POST /auth/login`** 을 열고 `Try it out` → 이메일·비밀번호 입력 → `Execute`',
      '2. 200 응답이 오면 끝입니다. 인증 쿠키는 브라우저에 저장되고(화면에는 보이지 않음), 이후 요청에 자동으로 실립니다.',
      '3. `GET /auth/me`가 200이면 로그인된 상태입니다.',
      '',
      '자물쇠 아이콘은 "로그인이 필요한 API"라는 표시일 뿐, 로그인 상태를 나타내지 않습니다.',
      '',
      '**에러 응답**: 모든 에러는 `{ "success": false, "message": "..." }` 형태입니다.',
    ].join('\n'),
  },

  servers: [
    {
      url: config.API_BASE_URL.replace(/\/+$/, ''),
      description: isProduction ? '배포 서버' : '로컬 서버',
    },
  ],
  tags: [
    { name: '인증' },
    { name: '사용자' },
    { name: '알림' },
    { name: '챌린지' },
    { name: '챌린지 관리 (관리자)' },
    { name: '참여' },
    { name: '작업물' },
    { name: '임시저장' },
    { name: '좋아요' },
    { name: '피드백' },
    { name: '시스템' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: '로그인하면 자동으로 설정되는 인증 쿠키',
      },
    },
  },
  paths: {
    ...authPaths,
    ...userPaths,
    ...challengePaths,
    ...participationPaths,
    ...submissionPaths,
    ...feedbackPaths,
    ...systemPaths,
  },
});
