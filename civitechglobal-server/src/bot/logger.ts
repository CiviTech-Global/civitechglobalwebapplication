import pino from 'pino';
import { botConfig } from './config.js';

export const logger = pino({
  level: botConfig.isProduction ? 'info' : 'debug',
  transport: botConfig.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});
