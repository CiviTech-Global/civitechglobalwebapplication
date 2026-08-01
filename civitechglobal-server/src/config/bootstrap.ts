import { prisma } from './database.js';
import { env } from './env.js';
import { logger } from './logger.js';
import { hashPassword } from '../utils/password.js';
import { encryptRequired, hashForSearch, normalizeEmail } from '../utils/pii.js';
import { runAsSystem } from '../utils/requestContext.js';

/**
 * Ensures a Super Admin user exists on first startup.
 * If no SUPER_ADMIN user is found in the database, one is created
 * using credentials from environment variables.
 *
 * If the database tables don't exist yet (migrations not run),
 * this logs a warning and skips — the server still starts.
 */
export async function bootstrapSuperAdmin(): Promise<void> {
  return runAsSystem(async () => {
    try {
      const emailHash = hashForSearch(normalizeEmail(env.ADMIN_EMAIL));

      const existing = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN', deletedAt: null },
      });

      if (existing) {
        // Backfill PII fields for users created before emailHash encryption was required.
        if (!existing.emailHash && emailHash) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              email: encryptRequired(env.ADMIN_EMAIL),
              emailHash,
              firstName: encryptRequired(env.ADMIN_FIRST_NAME),
              lastName: encryptRequired(env.ADMIN_LAST_NAME),
            },
          });
          logger.info('Backfilled encrypted PII fields for existing Super Admin');
        }
        return;
      }

      const hashed = await hashPassword(env.ADMIN_PASSWORD);

      await prisma.user.create({
        data: {
          email: encryptRequired(env.ADMIN_EMAIL),
          emailHash,
          password: hashed,
          firstName: encryptRequired(env.ADMIN_FIRST_NAME),
          lastName: encryptRequired(env.ADMIN_LAST_NAME),
          role: 'SUPER_ADMIN',
          permissions: [
            'products',
            'services',
            'opportunities',
            'orders',
            'tickets',
            'users',
            'content',
            'analytics',
            'roles',
            'admins',
          ],
        },
      });

      logger.info('-----------------------------------------------');
      logger.info('  Initial Super Admin created');
      logger.info(`  Email: ${env.ADMIN_EMAIL}`);
      logger.info('  (Credentials were read from environment variables)');
      logger.info('-----------------------------------------------');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      // P2021 = table does not exist, P2010 = raw query failed (schema not applied)
      if (code === 'P2021' || code === 'P2010') {
        logger.warn('Database tables not found. Run "npx prisma migrate dev" or "npx prisma db push" first.');
        logger.warn('Skipping Super Admin bootstrap — server starting without it.');
      } else {
        throw err;
      }
    }
  });
}
