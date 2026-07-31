import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT pid, state, application_name, query_start, query
    FROM pg_stat_activity
    WHERE datname = current_database()
  `;
  console.table(rows);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
