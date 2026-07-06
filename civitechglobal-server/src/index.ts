import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { bootstrapSuperAdmin } from './config/bootstrap.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import routes from './routes/index.js';

const app = express();

// Security
app.use(helmet());
app.use(cors(corsOptions));

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'CiviTech Global API is running' });
});

app.use('/api', generalRateLimiter, routes);

// Error handling
app.use(errorHandler);

bootstrapSuperAdmin()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch((err) => {
    logger.error(err, 'Failed to bootstrap Super Admin');
    process.exit(1);
  });

export default app;
