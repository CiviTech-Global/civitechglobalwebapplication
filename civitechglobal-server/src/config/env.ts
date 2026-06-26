import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Initial Super Admin credentials (used on first startup)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'superadmin@civitechglobal.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'SuperAdmin@123',
  ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME || 'Super',
  ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME || 'Admin',
};

const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
