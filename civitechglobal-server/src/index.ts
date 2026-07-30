import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { logger } from './config/logger.js';
import { prisma, disconnectPrisma } from './config/database.js';
import { pingRedis, disconnectRedis } from './config/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import { bootstrapSuperAdmin } from './config/bootstrap.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import routes from './routes/index.js';

const app = express();

// Trust first proxy (nginx) for correct req.ip and rate limiting
app.set('trust proxy', 1);

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

// Liveness probe (must stay above /api rate limiter)
app.get('/api/health/live', (_req, res) => {
  res.json({ success: true, message: 'CiviTech Global API is alive' });
});

// Basic compatibility health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'CiviTech Global API is running' });
});

// Readiness probe: verifies downstream dependencies
app.get('/api/health/ready', async (_req, res) => {
  const checks: Record<string, boolean> = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    logger.error({ err }, 'Readiness check failed: database');
    checks.database = false;
  }

  try {
    await pingRedis();
    checks.redis = true;
  } catch (err) {
    logger.error({ err }, 'Readiness check failed: redis');
    checks.redis = false;
  }

  const healthy = Object.values(checks).every(Boolean);
  if (healthy) {
    res.json({ success: true, message: 'API is ready', checks });
  } else {
    res.status(503).json({ success: false, message: 'API is not ready', checks });
  }
});

// Routes
app.use('/api', generalRateLimiter, routes);

// Error handling
app.use(errorHandler);

function handleFatalError(label: string, err: unknown) {
  logger.error({ err }, `${label} received`);
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
