import dotenv from 'dotenv';
import { assertPasswordStrong } from '../utils/passwordPolicy.js';
dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function warnIfWeakSecret(key: string, value: string): void {
  if (value.length < 32) {
    console.warn(`WARNING: ${key} should be at least 32 characters long in production.`);
  }
}

export const env = {
  PORT: parseInt(getEnvOrDefault('PORT', '5000'), 10),
  DATABASE_URL: getEnv('DATABASE_URL'),
  REDIS_URL: getEnv('REDIS_URL'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  PII_ENCRYPTION_KEY: getEnvOrDefault('PII_ENCRYPTION_KEY', 'dev-pii-encryption-key-min-32-chars!!'),
  PII_HMAC_KEY: getEnvOrDefault('PII_HMAC_KEY', 'dev-pii-hmac-key-min-32-chars!!!!!!'),
  CLIENT_URL:
    process.env.NODE_ENV === 'production'
      ? getEnv('CLIENT_URL')
      : getEnvOrDefault('CLIENT_URL', 'http://localhost:5173'),
  NODE_ENV: getEnvOrDefault('NODE_ENV', 'development'),
  isProduction: getEnvOrDefault('NODE_ENV', 'development') === 'production',

  // Initial Super Admin credentials (used on first startup)
  // In production these must be set to strong, unique values.
  ADMIN_EMAIL: getEnvOrDefault('ADMIN_EMAIL', 'superadmin@civitechglobal.com'),
  ADMIN_PASSWORD: getEnv('ADMIN_PASSWORD'),
  ADMIN_FIRST_NAME: getEnvOrDefault('ADMIN_FIRST_NAME', 'Super'),
  ADMIN_LAST_NAME: getEnvOrDefault('ADMIN_LAST_NAME', 'Admin'),

  // Telegram Bot Configuration
  TELEGRAM_BOT_TOKEN: getEnvOrDefault('TELEGRAM_BOT_TOKEN', ''),
  TELEGRAM_BOT_MODE: getEnvOrDefault('TELEGRAM_BOT_MODE', 'polling'),
  TELEGRAM_WEBHOOK_URL: getEnvOrDefault('TELEGRAM_WEBHOOK_URL', ''),
  TELEGRAM_WEBHOOK_SECRET: getEnvOrDefault('TELEGRAM_WEBHOOK_SECRET', ''),
  TELEGRAM_ADMIN_USER_IDS: getEnvOrDefault('TELEGRAM_ADMIN_USER_IDS', ''),

  // Observability
  SENTRY_DSN: getEnvOrDefault('SENTRY_DSN', ''),
  METRICS_ENABLED: getEnvOrDefault('METRICS_ENABLED', 'false') === 'true',
  LOG_LEVEL: getEnvOrDefault('LOG_LEVEL', 'info'),
};

warnIfWeakSecret('JWT_SECRET', env.JWT_SECRET);
warnIfWeakSecret('JWT_REFRESH_SECRET', env.JWT_REFRESH_SECRET);

if (env.isProduction) {
  assertPasswordStrong(env.ADMIN_PASSWORD, 'ADMIN_PASSWORD');
  if (env.PII_ENCRYPTION_KEY.length < 32) {
    throw new Error('PII_ENCRYPTION_KEY must be at least 32 characters long in production.');
  }
  if (env.PII_HMAC_KEY.length < 32) {
    throw new Error('PII_HMAC_KEY must be at least 32 characters long in production.');
  }
}
