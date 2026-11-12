import { trustedOrigins } from '#config';
import { ERROR_MESSAGE } from '#constants';
import { ForbiddenException } from '#exceptions';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getRefererOrigin = (referer) => {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
};

export const originGuard = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const { origin, referer } = req.headers;
  const requestOrigin =
    origin ?? (referer ? getRefererOrigin(referer) : undefined);

  if (requestOrigin === undefined) {
    return next();
  }

  if (requestOrigin && trustedOrigins.includes(requestOrigin)) {
    return next();
  }

  next(new ForbiddenException(ERROR_MESSAGE.UNTRUSTED_ORIGIN));
};
