import dotenv from 'dotenv';

dotenv.config();

export const botConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN!,
  mode: process.env.TELEGRAM_BOT_MODE || 'polling',
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  port: parseInt(process.env.TELEGRAM_BOT_PORT || '4000', 10),
  adminUserIds: (process.env.TELEGRAM_ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => Number(id))
    .filter((id) => !isNaN(id)),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

const required = ['TELEGRAM_BOT_TOKEN'] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
