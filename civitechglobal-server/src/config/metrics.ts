import { Registry, collectDefaultMetrics, Histogram, Gauge, Counter } from 'prom-client';
import { env } from './env.js';

export const register = new Registry();

// Collect default Node.js metrics (GC, event loop, memory, etc.)
if (env.METRICS_ENABLED) {
  collectDefaultMetrics({ register });
}

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
register.registerMetric(httpRequestDuration);

export const dbHealthGauge = new Gauge({
  name: 'db_health_status',
  help: 'Database health status: 1 = healthy, 0 = unhealthy',
});
register.registerMetric(dbHealthGauge);

export const redisHealthGauge = new Gauge({
  name: 'redis_health_status',
  help: 'Redis health status: 1 = healthy, 0 = unhealthy',
});
register.registerMetric(redisHealthGauge);

export const authFailures = new Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['reason'],
});
register.registerMetric(authFailures);
