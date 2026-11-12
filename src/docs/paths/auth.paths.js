import { z } from 'zod';
import {
  loginSchema,
  signUpSchema,
} from '../../controllers/auth/dto/auth.dto.js';
import {
  socialCallbackQuerySchema,
  socialLoginQuerySchema,
} from '../../controllers/auth/dto/social.dto.js';
import { EXAMPLES } from '../examples.js';
import { AUTH, body, errors, json, noContent } from '../helpers.js';
import { meSchema } from '../schemas/user.schema.js';

const tags = ['인증'];

const SET_COOKIE_NOTE =
  '성공하면 `accessToken`, `refreshToken` 쿠키가 발급됩니다.';

const redirect = (description) => ({
  description,
  headers: {
    Location: { schema: { type: 'string' }, description: '이동할 주소' },
  },
});

export const authPaths = {
  '/auth/signup': {
    post: {
      tags,
      summary: '회원가입',
      description: SET_COOKIE_NOTE,
      requestBody: body(signUpSchema, { examples: EXAMPLES.signUp }),
      responses: {
        201: json('가입 성공', meSchema),
        ...errors(400, {
          409: '이메일 또는 닉네임 중복 (둘 다 중복이면 메시지가 줄바꿈으로 이어집니다)',
        }),
      },
    },
  },
  '/auth/login': {
    post: {
      tags,
      summary: '로그인',
      description: SET_COOKIE_NOTE,
      requestBody: body(loginSchema, { examples: EXAMPLES.login }),
      responses: {
        200: json('로그인 성공', meSchema),
        ...errors(400, { 401: '이메일 또는 비밀번호가 올바르지 않습니다.' }),
      },
    },
  },
  '/auth/logout': {
    post: {
      tags,
      summary: '로그아웃',
      description:
        '인증 쿠키를 삭제합니다. 로그인하지 않아도 204로 응답합니다.',
      responses: { 204: noContent('로그아웃 성공') },
    },
  },
  '/auth/me': {
    get: {
      tags,
      summary: '내 정보 조회',
      security: AUTH,
      responses: {
        200: json('조회 성공', meSchema),
        ...errors(401, { 404: '사용자를 찾을 수 없습니다.' }),
      },
    },
  },
  '/auth/google': {
    get: {
      tags,
      summary: '구글 로그인 시작',
      description:
        '구글 인증 페이지로 리다이렉트합니다. Swagger에서 실행하지 말고 브라우저 주소창으로 접근하세요.',
      requestParams: {
        query: socialLoginQuerySchema.extend({
          next: z.string().optional().default('/').meta({
            description: '로그인 후 돌아갈 프론트엔드 경로',
          }),
        }),
      },
      responses: { 302: redirect('구글 인증 페이지로 이동') },
    },
  },
  '/auth/google/callback': {
    get: {
      tags,
      summary: '구글 로그인 콜백',
      description:
        '구글이 호출하는 주소입니다. 성공하면 인증 쿠키를 발급하고 `next` 경로로, 실패하면 프론트엔드 `/login?error=메시지`로 리다이렉트합니다.',
      requestParams: { query: socialCallbackQuerySchema },
      responses: { 302: redirect('프론트엔드로 이동') },
    },
  },
};
