/**
 * Burst-test the Telegram webhook Redis-backed per-IP rate limiter.
 *
 * Sends 70 requests from the same IP and verifies that the first 60 succeed
 * and the remainder are blocked with HTTP 429.
 *
 * Usage:
 *   npx tsx scripts/verify-webhook-rate-limit.ts
 */
import fastify from 'fastify';
import { webhookRateLimit } from '../src/bot/middleware/webhookRateLimit.js';
import { redis } from '../src/config/redis.js';

const TEST_IP = '127.0.0.1';
const WINDOW_KEY = `webhook:ip:${TEST_IP}`;
const BLOCK_KEY = `${WINDOW_KEY}:blocked`;

async function main() {
  await redis.del(WINDOW_KEY, BLOCK_KEY);

  const app = fastify();
  app.post('/webhook', { preHandler: webhookRateLimit }, async () => ({ ok: true }));

  const total = 70;
  let success = 0;
  let blocked = 0;
  const unexpected: number[] = [];

  for (let i = 0; i < total; i++) {
    const res = await app.inject({ method: 'POST', url: '/webhook', payload: {} });
    if (res.statusCode === 200) {
      success++;
    } else if (res.statusCode === 429) {
      blocked++;
    } else {
      unexpected.push(res.statusCode);
    }
  }

  await redis.del(WINDOW_KEY, BLOCK_KEY);

  console.log(`Total requests: ${total}`);
  console.log(`Allowed (200): ${success}`);
  console.log(`Blocked (429): ${blocked}`);
  console.log(`Unexpected: ${unexpected.join(', ') || 'none'}`);

  if (success !== 60 || blocked !== 10 || unexpected.length > 0) {
    throw new Error('Webhook rate-limit verification failed');
  }
  console.log('Webhook rate-limit verification passed');
  await app.close();
  await redis.quit();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
