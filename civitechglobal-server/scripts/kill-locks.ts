import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Terminate any sessions holding the Prisma migrate advisory lock or stale migrate sessions.
  await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid() AND (query LIKE '%pg_advisory_lock%' OR query LIKE '%prisma_migrate_shadow_db%');`);
  console.log('Terminated stale migrate sessions');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
