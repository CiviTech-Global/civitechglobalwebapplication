/**
 * Manual verification script for PostgreSQL RLS policies.
 *
 * Uses a non-superuser test role (RLS is bypassed for table owners and superusers).
 * Confirms that:
 * 1. Queries without request context return zero rows on protected tables.
 * 2. SYSTEM context can see all rows.
 * 3. A plain USER context can only see their own row.
 *
 * Usage:
 *   npx tsx scripts/verify-rls.ts
 */
import { PrismaClient } from '@prisma/client';

const TEST_ROLE = 'rls_test_role';
const prisma = new PrismaClient();

async function setupTestRole() {
  await prisma.$executeRawUnsafe(`DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${TEST_ROLE}') THEN
    CREATE ROLE ${TEST_ROLE} NOLOGIN NOINHERIT;
  END IF;
END
$$;`);

  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO ${TEST_ROLE};`);
  for (const table of [
    'users',
    'orders',
    'order_items',
    'tickets',
    'ticket_messages',
    'opportunity_applications',
    'refresh_tokens',
  ]) {
    await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON "${table}" TO ${TEST_ROLE};`);
  }
}

async function countUsers(tx: { $queryRaw: PrismaClient['$queryRaw'] }) {
  const result = await tx.$queryRaw<{ count: number }[]>`SELECT COUNT(*)::int as count FROM "users"`;
  return result[0].count;
}

async function main() {
  try {
    await setupTestRole();

    // 1. No context via test role: should be blocked (0 rows).
    const publicCount = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${TEST_ROLE};`);
      return countUsers(tx as unknown as { $queryRaw: PrismaClient['$queryRaw'] });
    });
    console.log(`Users visible without context: ${publicCount} (expected 0)`);

    // 2. SYSTEM context via test role: should see all rows.
    const systemCount = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${TEST_ROLE};`);
      await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = 'system';`);
      await tx.$executeRawUnsafe(`SET LOCAL app."current_role" = 'SYSTEM';`);
      return countUsers(tx as unknown as { $queryRaw: PrismaClient['$queryRaw'] });
    });
    console.log(`Users visible as SYSTEM: ${systemCount} (expected > 0)`);

    // 3. USER context via test role: should see only the row matching the GUC.
    const ownerId = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${TEST_ROLE};`);
      await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = 'system';`);
      await tx.$executeRawUnsafe(`SET LOCAL app."current_role" = 'SYSTEM';`);
      const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "users" LIMIT 1`;
      return rows[0]?.id;
    });

    if (!ownerId) {
      console.log('No users found; skipping owner-scoped RLS test.');
      return;
    }

    const ownerCount = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${TEST_ROLE};`);
      await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = ${escapeLiteral(ownerId)};`);
      await tx.$executeRawUnsafe(`SET LOCAL app."current_role" = 'USER';`);
      return countUsers(tx as unknown as { $queryRaw: PrismaClient['$queryRaw'] });
    });
    console.log(`Users visible as owner ${ownerId}: ${ownerCount} (expected 1)`);

    if (publicCount !== 0 || systemCount === 0 || ownerCount !== 1) {
      throw new Error('RLS verification failed');
    }
    console.log('RLS verification passed');
  } catch (error) {
    console.error('RLS verification error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function escapeLiteral(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "''");
  return `'${escaped}'`;
}

main();
