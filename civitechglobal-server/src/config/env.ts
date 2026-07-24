import dotenv from 'dotenv';
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
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
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
};

warnIfWeakSecret('JWT_SECRET', env.JWT_SECRET);
warnIfWeakSecret('JWT_REFRESH_SECRET', env.JWT_REFRESH_SECRET);

if (env.isProduction) {
  if (env.ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long in production.');
  }
}
