import { isProduction } from '#config';
import { flattenError } from 'zod';
import { ERROR_MESSAGE } from '#constants';
import { BadRequestException } from '#exceptions';

/**
 * 범용 검증 미들웨어
 * @param {string} target - 검증할 대상 ('body', 'params', 'query')
 * @param {ZodSchema} schema - Zod 스키마
 */
export const validate = (target, schema) => {
  if (!['body', 'query', 'params'].includes(target)) {
    throw new Error(
      `[validate middleware] 유효하지 않은 target입니다: "${target}". "body", "query", "params" 중 하나여야 합니다.`,
    );
  }
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const { fieldErrors } = flattenError(result.error);

        if (isProduction) {
          throw new BadRequestException(ERROR_MESSAGE.INVALID_INPUT);
        }

        throw new BadRequestException(
          ERROR_MESSAGE.VALIDATION_FAILED,
          fieldErrors,
        );
      }

      // 검증된 데이터로 교체
      Object.defineProperty(req, target, {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};
