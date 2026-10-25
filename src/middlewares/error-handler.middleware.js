import { DB_ERROR, ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { HttpException } from '#exceptions';

export const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.sqlState === DB_ERROR.UNIQUE_VIOLATION) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: ERROR_MESSAGE.RESOURCE_CONFLICT,
    });
  }

  // 처리되지 않은 모든 에러
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
  });
};
