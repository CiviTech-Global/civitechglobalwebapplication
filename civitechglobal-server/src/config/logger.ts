import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

export const sensitivePaths = [
  'password',
  '*.password',
  'token',
  '*.token',
  'refreshToken',
  '*.refreshToken',
  'email',
  '*.email',
  'phone',
  '*.phone',
  'phoneNumber',
  '*.phoneNumber',
  'ctx.update.message.text',
  '*.ctx.update.message.text',
  'ctx.update.message.contact.phone_number',
  '*.ctx.update.message.contact.phone_number',
  'req.body.password',
  '*.req.body.password',
  'req.body.email',
  '*.req.body.email',
  'err.password',
  '*.err.password',
];

export const logger = pino({
  level: logLevel,
  redact: {
    paths: sensitivePaths,
    remove: false,
    censor: '[REDACTED]',
  },
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
});
