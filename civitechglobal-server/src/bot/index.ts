import 'dotenv/config';
import { createApp } from './app.js';
import { botConfig } from './config.js';
import { logger } from './logger.js';

async function bootstrap() {
  try {
    const app = await createApp();
    await app.listen({ port: botConfig.port, host: '0.0.0.0' });
    logger.info({ port: botConfig.port, mode: botConfig.mode }, 'Bot server started');
  } catch (error) {
    logger.error({ error }, 'Failed to start bot server');
    process.exit(1);
  }
}

bootstrap();
