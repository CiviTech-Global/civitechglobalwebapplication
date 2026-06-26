import { prisma } from './database.js';
import { env } from './env.js';
import { hashPassword } from '../utils/password.js';

/**
 * Ensures a Super Admin user exists on first startup.
 * If no SUPER_ADMIN user is found in the database, one is created
 * using credentials from environment variables.
 *
 * If the database tables don't exist yet (migrations not run),
 * this logs a warning and skips — the server still starts.
 */
export async function bootstrapSuperAdmin(): Promise<void> {
  try {
    const existing = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existing) return;

    const hashed = await hashPassword(env.ADMIN_PASSWORD);

    await prisma.user.create({
      data: {
        email: env.ADMIN_EMAIL,
        password: hashed,
        firstName: env.ADMIN_FIRST_NAME,
        lastName: env.ADMIN_LAST_NAME,
        role: 'SUPER_ADMIN',
        permissions: [
          'products', 'services', 'opportunities', 'orders',
          'tickets', 'users', 'content', 'analytics', 'roles', 'admins',
        ],
      },
    });

    console.log('-----------------------------------------------');
    console.log('  Initial Super Admin created');
    console.log(`  Email:    ${env.ADMIN_EMAIL}`);
    console.log(`  Password: ${env.ADMIN_PASSWORD}`);
    console.log('  (Change these in .env and restart if needed)');
    console.log('-----------------------------------------------');
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    // P2021 = table does not exist, P2010 = raw query failed (schema not applied)
    if (code === 'P2021' || code === 'P2010') {
      console.warn('Database tables not found. Run "npx prisma migrate dev" or "npx prisma db push" first.');
      console.warn('Skipping Super Admin bootstrap — server starting without it.');
    } else {
      throw err;
    }
  }
}
