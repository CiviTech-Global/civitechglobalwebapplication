import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import type { Request } from 'express';
import { redis } from '../config/redis.js';

const createRedisStore = (prefix: string) =>
  new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as unknown as any,
    prefix,
  });

const keyGenerator = (req: Request) => (req.user?.userId ?? (req.ip ? ipKeyGenerator(req.ip) : 'unknown')) as string;

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('rl:auth:'),
  keyGenerator,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('rl:general:'),
  keyGenerator,
});
