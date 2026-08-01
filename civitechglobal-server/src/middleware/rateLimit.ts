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

const rateLimitMessage = { success: false, message: 'Too many attempts, please try again later.' };

/** Brute-force protection for credential submission (login/register). */
export const credentialRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('rl:auth:credentials:'),
  keyGenerator,
  skipSuccessfulRequests: true,
  message: rateLimitMessage,
});

/** Token refresh is called on app load; keep a separate, higher bucket. */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('rl:auth:refresh:'),
  keyGenerator,
  message: rateLimitMessage,
});

/** @deprecated Use credentialRateLimiter or refreshRateLimiter instead. */
export const authRateLimiter = credentialRateLimiter;

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('rl:general:'),
  keyGenerator,
});
