import { flattenError, z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().min(1000).max(65535).default(5001),
  DATABASE_URL: z.url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  OAUTH_STATE_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().optional().default(''),
  API_BASE_URL: z.string().optional().default(''),
  CLIENT_BASE_URL: z.string().optional().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().trim().min(1),
  GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
  OAUTH_REDIRECT_BASE_URL: z.url(),
});

const parseEnvironment = () => {
  try {
    const parsedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      OAUTH_STATE_SECRET: process.env.OAUTH_STATE_SECRET,
      CORS_ORIGINS: process.env.CORS_ORIGINS,
      API_BASE_URL: process.env.API_BASE_URL,
      CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      OAUTH_REDIRECT_BASE_URL: process.env.OAUTH_REDIRECT_BASE_URL,
    });

    return {
      ...parsedEnv,
      API_BASE_URL:
        parsedEnv.API_BASE_URL || `http://localhost:${parsedEnv.PORT}`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { fieldErrors } = flattenError(error);
      console.error('환경 변수 검증 실패:', fieldErrors);
    }
    process.exit(1);
  }
};

export const config = parseEnvironment();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

export const corsOrigins = config.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// 상태 변경 요청(POST/PUT/PATCH/DELETE)을 받아도 되는 출처입니다.
// 프론트엔드(CORS_ORIGINS)와 같은 서버에서 열리는 Swagger 문서(API_BASE_URL)를 포함합니다.
const toOrigin = (url) => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

export const trustedOrigins = [
  ...new Set(
    [...corsOrigins, config.API_BASE_URL].map(toOrigin).filter(Boolean),
  ),
];
