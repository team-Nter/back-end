import { corsOrigins } from '#config';

export const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = origin && corsOrigins.includes(origin);

  if (origin) {
    res.vary('Origin');
  }

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
