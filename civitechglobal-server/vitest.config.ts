import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      DATABASE_URL: 'postgresql://user:password@localhost:5432/civitechglobal?schema=public',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'test-jwt-secret-min-32-chars-long',
      JWT_REFRESH_SECRET: 'test-refresh-secret-min-32-chars',
      ADMIN_PASSWORD: 'TestAdminPass123!',
      DEMO_ADMIN_PASSWORD: 'TestDemoAdmin123!',
      USER_PASSWORD: 'TestUserPass123!',
      TELEGRAM_BOT_TOKEN: 'test-token',
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'prisma/'],
    },
  },
});
