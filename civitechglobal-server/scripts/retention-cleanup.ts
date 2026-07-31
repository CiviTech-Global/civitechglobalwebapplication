/**
 * Retention & anonymization cleanup job.
 *
 * Defaults to dry-run. Pass --execute to mutate data.
 * Uses runAsSystem so soft-delete/RLS filters do not hide rows.
 */
import { prisma, disconnectPrisma } from '../src/config/database.js';
import { runAsSystem } from '../src/utils/requestContext.js';
import { encrypt, encryptRequired } from '../src/utils/pii.js';

const REDACTED = '[REDACTED]';

const hasExecute = process.argv.includes('--execute');
const hasDryRun = process.argv.includes('--dry-run');
const dryRun = hasDryRun || !hasExecute;

function getEnvDays(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name} value: ${value}`);
  }
  return parsed;
}

function getThresholdDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function cleanupExpiredRefreshTokens(now: Date, threshold: Date) {
  const where = {
    OR: [{ expiresAt: { lt: now } }, { revokedAt: { lt: threshold } }],
  };

  const count = await prisma.refreshToken.count({ where });
  if (!dryRun && count > 0) {
    await prisma.refreshToken.deleteMany({ where });
  }
  return count;
}

async function anonymizeOldLeads(threshold: Date) {
  const where = { createdAt: { lt: threshold } };

  const count = await prisma.lead.count({ where });
  if (!dryRun && count > 0) {
    await prisma.lead.updateMany({
      where,
      data: {
        telegramUsername: encrypt(REDACTED),
        telegramFirstName: encrypt(REDACTED),
        fullName: encryptRequired(REDACTED),
        phoneNumber: encryptRequired(REDACTED),
        city: encryptRequired(REDACTED),
        notes: encrypt(REDACTED),
        phoneNumberHash: null,
      },
    });
  }
  return count;
}

async function anonymizeOldTickets(threshold: Date) {
  const ticketWhere = { createdAt: { lt: threshold } };

  const ticketCount = await prisma.ticket.count({ where: ticketWhere });
  if (!dryRun && ticketCount > 0) {
    await prisma.ticket.updateMany({
      where: ticketWhere,
      data: {
        subject: encryptRequired(REDACTED),
        email: encryptRequired(REDACTED),
        emailHash: null,
      },
    });

    // Also scrub message contents for tickets past retention.
    await prisma.ticketMessage.updateMany({
      where: {
        ticket: { createdAt: { lt: threshold } },
      },
      data: { content: REDACTED },
    });
  }
  return ticketCount;
}

async function main() {
  const refreshTokenDays = getEnvDays('RETENTION_REFRESH_TOKEN_DAYS', 30);
  const leadDays = getEnvDays('RETENTION_LEAD_DAYS', 365);
  const ticketDays = getEnvDays('RETENTION_TICKET_DAYS', 730);

  const now = new Date();
  const refreshTokenThreshold = getThresholdDate(refreshTokenDays);
  const leadThreshold = getThresholdDate(leadDays);
  const ticketThreshold = getThresholdDate(ticketDays);

  console.log(`Running retention cleanup (dryRun=${dryRun})`);
  console.log(`Refresh-token threshold: ${refreshTokenThreshold.toISOString()} (${refreshTokenDays} days)`);
  console.log(`Lead threshold:          ${leadThreshold.toISOString()} (${leadDays} days)`);
  console.log(`Ticket threshold:        ${ticketThreshold.toISOString()} (${ticketDays} days)`);

  const counts = await runAsSystem(async () => {
    const refreshTokens = await cleanupExpiredRefreshTokens(now, refreshTokenThreshold);
    const leads = await anonymizeOldLeads(leadThreshold);
    const tickets = await anonymizeOldTickets(ticketThreshold);
    return { refreshTokens, leads, tickets };
  });

  console.log('');
  console.log(`Expired refresh tokens removed: ${counts.refreshTokens}`);
  console.log(`Leads anonymized:               ${counts.leads}`);
  console.log(`Tickets anonymized:             ${counts.tickets}`);

  if (dryRun) {
    console.log('\nDry run completed. No changes were made. Pass --execute to apply.');
  }
}

main()
  .catch((error) => {
    console.error('Retention cleanup failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
