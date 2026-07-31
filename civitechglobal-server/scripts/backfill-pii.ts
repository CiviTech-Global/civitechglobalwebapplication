/**
 * Backfill script for Wave B PII encryption.
 *
 * Run after applying the Prisma migrations that add hash columns and enable RLS.
 * The script encrypts any remaining plaintext PII and populates deterministic
 * search hashes for users, tickets, and leads.
 *
 * Usage (from the server directory):
 *   npx tsx scripts/backfill-pii.ts
 */
import { prisma } from '../src/config/database.js';
import { runAsSystem } from '../src/utils/requestContext.js';
import {
  encrypt,
  encryptRequired,
  hashForSearch,
  normalizeEmail,
  normalizePhone,
} from '../src/utils/pii.js';

const BATCH_SIZE = 200;

async function backfillUsers() {
  let cursor: string | undefined;
  let processed = 0;

  do {
    const users = await prisma.user.findMany({
      where: { emailHash: null },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) break;

    await prisma.$transaction(
      users.map((user) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            email: encryptRequired(user.email),
            emailHash: hashForSearch(normalizeEmail(user.email)),
            firstName: encryptRequired(user.firstName),
            lastName: encryptRequired(user.lastName),
            phone: user.phone ? encrypt(user.phone) : null,
            phoneHash: user.phone ? hashForSearch(normalizePhone(user.phone)) : null,
          },
        }),
      ),
    );

    processed += users.length;
    cursor = users[users.length - 1].id;
    console.log(`Backfilled ${processed} users...`);
  } while (true);

  console.log(`User backfill complete: ${processed} rows`);
}

async function backfillTickets() {
  let cursor: string | undefined;
  let processed = 0;

  do {
    const tickets = await prisma.ticket.findMany({
      where: { emailHash: null },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (tickets.length === 0) break;

    await prisma.$transaction(
      tickets.map((ticket) =>
        prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            email: encryptRequired(ticket.email),
            emailHash: hashForSearch(normalizeEmail(ticket.email)),
          },
        }),
      ),
    );

    processed += tickets.length;
    cursor = tickets[tickets.length - 1].id;
    console.log(`Backfilled ${processed} tickets...`);
  } while (true);

  console.log(`Ticket backfill complete: ${processed} rows`);
}

async function backfillLeads() {
  let cursor: string | undefined;
  let processed = 0;

  do {
    const leads = await prisma.lead.findMany({
      where: { phoneNumberHash: null },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (leads.length === 0) break;

    await prisma.$transaction(
      leads.map((lead) =>
        prisma.lead.update({
          where: { id: lead.id },
          data: {
            telegramUsername: lead.telegramUsername ? encrypt(lead.telegramUsername) : null,
            telegramFirstName: lead.telegramFirstName ? encrypt(lead.telegramFirstName) : null,
            fullName: encryptRequired(lead.fullName),
            phoneNumber: encryptRequired(lead.phoneNumber),
            phoneNumberHash: hashForSearch(normalizePhone(lead.phoneNumber)),
            city: encryptRequired(lead.city),
          },
        }),
      ),
    );

    processed += leads.length;
    cursor = leads[leads.length - 1].id;
    console.log(`Backfilled ${processed} leads...`);
  } while (true);

  console.log(`Lead backfill complete: ${processed} rows`);
}

async function main() {
  await runAsSystem(async () => {
    console.log('Starting PII backfill...');
    await backfillUsers();
    await backfillTickets();
    await backfillLeads();
    console.log('PII backfill finished successfully');
  });
}

main()
  .catch((error) => {
    console.error('PII backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
