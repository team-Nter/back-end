import { randomBytes } from 'node:crypto';

export const createGuestNickname = () => {
  const suffix = randomBytes(3).toString('hex');
  return `게스트${suffix}`;
};
