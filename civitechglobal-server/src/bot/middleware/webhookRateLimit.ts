import type { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../../config/redis.js';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 60;
const BLOCK_SECONDS = 600;

function key(ip: string): string {
  return `webhook:ip:${ip}`;
}

export async function webhookRateLimit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const ip = request.ip || 'unknown';
  const blockKey = `${key(ip)}:blocked`;

  const isBlocked = await redis.get(blockKey);
  if (isBlocked) {
    return reply.status(429).send({ ok: false, error: 'Too many requests' });
  }

  const count = await redis.incr(key(ip));
  if (count === 1) {
    await redis.expire(key(ip), WINDOW_SECONDS);
  }

  if (count > MAX_REQUESTS) {
    await redis.set(blockKey, '1', 'EX', BLOCK_SECONDS);
    return reply.status(429).send({ ok: false, error: 'Too many requests' });
  }
}
