import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { pinoHttp } from 'pino-http';
import * as Sentry from '@sentry/node';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { logger } from './config/logger.js';
import { prisma, disconnectPrisma } from './config/database.js';
import { pingRedis, disconnectRedis } from './config/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import { bootstrapSuperAdmin } from './config/bootstrap.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import { optionalAuth } from './middleware/authenticate.js';
import { runAsSystem, setRequestContext } from './utils/requestContext.js';
import { register, httpRequestDuration, dbHealthGauge, redisHealthGauge } from './config/metrics.js';
import routes from './routes/index.js';

// Initialize Sentry before creating the app so error tracking is ready.
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,
  });
}

const app = express();

// Trust proxy configuration for correct req.ip and rate limiting.
// Set TRUST_PROXY env var to number, comma-separated IPs, or boolean.
app.set('trust proxy', env.TRUST_PROXY);

// Security
app.use(
  helmet({
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  }),
);
app.use(cors(corsOptions));

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request logging with correlation IDs. Reuses the shared Pino logger and
// enriches every log line with request context.
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => {
      const header = req.headers['x-request-id'];
      if (typeof header === 'string' && header.trim().length > 0) {
        return header.trim();
      }
      if (Array.isArray(header) && header[0]?.trim().length > 0) {
        return header[0].trim();
      }
      return randomUUID();
    },
    customAttributeKeys: {
      reqId: 'reqId',
    },
    customProps: (req) => ({
      user: req.user ? { userId: req.user.userId, role: req.user.role } : undefined,
    }),
  }),
);

// Expose the correlation ID back to clients.
app.use((req, res, next) => {
  res.setHeader('x-request-id', req.id as string);
  next();
});

// Set request-scoped DB context for RLS. Auth lookups run as SYSTEM so RLS
// does not block token verification; route handlers then run as the caller.
app.use((req, res, next) => {
  return runAsSystem(() => optionalAuth(req, res, () => setRequestContext(req, res, next)));
});

// Liveness probe (must stay above /api rate limiter)
app.get('/api/health/live', (_req, res) => {
  res.json({ success: true, message: 'CiviTech Global API is alive' });
});

// Basic compatibility health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'CiviTech Global API is running' });
});

// Readiness probe: verifies downstream dependencies and updates health gauges
app.get('/api/health/ready', async (_req, res) => {
  const checks: Record<string, boolean> = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
    dbHealthGauge.set(1);
  } catch (err) {
    logger.error({ message: (err as Error).message }, 'Readiness check failed: database');
    checks.database = false;
    dbHealthGauge.set(0);
  }

  try {
    await pingRedis();
    checks.redis = true;
    redisHealthGauge.set(1);
  } catch (err) {
    logger.error({ message: (err as Error).message }, 'Readiness check failed: redis');
    checks.redis = false;
    redisHealthGauge.set(0);
  }

  const healthy = Object.values(checks).every(Boolean);
  if (healthy) {
    res.json({ success: true, message: 'API is ready', checks });
  } else {
    res.status(503).json({ success: false, message: 'API is not ready', checks });
  }
});

// Prometheus metrics endpoint (only when enabled)
if (env.METRICS_ENABLED) {
  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}

// Record HTTP request durations/status codes for Prometheus. Placed before /api
// routes so the 'finish' event fires after the response is fully handled.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    const path = req.route?.path || req.path;
    httpRequestDuration.observe(
      {
        method: req.method,
        path,
        status_code: res.statusCode.toString(),
      },
      durationSeconds,
    );
  });
  next();
});

// Routes
app.use('/api', generalRateLimiter, routes);

// Error handling
app.use(errorHandler);

function handleFatalError(label: string, err: unknown) {
  logger.error({ err }, `${label} received`);
  if (env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  // Give logs a chance to flush, then exit
  setTimeout(() => process.exit(1), 1000).unref();
}

process.on('uncaughtException', (err) => handleFatalError('Uncaught exception', err));
process.on('unhandledRejection', (reason) => handleFatalError('Unhandled rejection', reason));

bootstrapSuperAdmin()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await disconnectPrisma();
          await disconnectRedis();
        } catch (err) {
          logger.error({ err }, 'Error during graceful shutdown');
        }
        process.exit(0);
      });

      // Force shutdown if graceful close hangs
      setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch((err) => {
    logger.error(err, 'Failed to bootstrap Super Admin');
    process.exit(1);
  });

export default app;
