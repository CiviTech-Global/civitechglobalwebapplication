import { PrismaClient } from '@prisma/client';
import { getRequestContext } from '../utils/requestContext.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const basePrisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma;
}

// Models that support soft-delete via a `deletedAt` column:
// User, Product, Service, Opportunity, AdminRole.
// Read and mutating operations that should be scoped to non-deleted rows
// unless the caller is running as SYSTEM (e.g., migrations, retention jobs).
const FILTERED_OPERATIONS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'upsert',
]);

function applySoftDeleteFilter(args: Record<string, unknown>, operation: string): Record<string, unknown> {
  // findUnique-style queries use a required `where`; all other filtered
  // operations accept an optional `where` object.
  if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
    const where = (args.where as Record<string, unknown> | undefined) || {};
    if (!('deletedAt' in where)) {
      return { ...args, where: { ...where, deletedAt: null } };
    }
    return args;
  }

  const where = (args.where as Record<string, unknown> | undefined) || {};
  if (!('deletedAt' in where)) {
    return { ...args, where: { ...where, deletedAt: null } };
  }
  return args;
}

function isSoftDeleteFilterBypassed(): boolean {
  const context = getRequestContext();
  return context?.role === 'SYSTEM';
}

// Layer 1: request-scoped RLS GUCs for Postgres row-level security policies.
const rlsExtendedPrisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const context = getRequestContext();
        const userId = context?.userId ?? '';
        const role = context?.role ?? 'PUBLIC';

        // Push request-scoped identity into Postgres for RLS policies.
        // These are session-level GUCs; setting them before each query prevents
        // stale values from leaking across pooled connections.
        await basePrisma.$executeRawUnsafe(`SET LOCAL app.current_user_id = ${escapeLiteral(userId)};`);
        await basePrisma.$executeRawUnsafe(`SET LOCAL app."current_role" = ${escapeLiteral(role)};`);

        return query(args);
      },
    },
  },
});

// Layer 2: global soft-delete filtering for supported models.
// SYSTEM context (runAsSystem) bypasses the filter so migrations, retention
// scripts, and explicit admin recovery flows can see deleted rows.
function softDeleteExtension(_modelName: string) {
  return {
    async $allOperations({
      operation,
      args,
      query,
    }: {
      operation: string;
      args: Record<string, unknown>;
      query: (args: Record<string, unknown>) => Promise<unknown>;
    }) {
      if (isSoftDeleteFilterBypassed() || !FILTERED_OPERATIONS.has(operation)) {
        return query(args);
      }
      const filteredArgs = applySoftDeleteFilter(args, operation);
      return query(filteredArgs);
    },
  };
}

export const prisma = rlsExtendedPrisma.$extends({
  query: {
    user: softDeleteExtension('User'),
    product: softDeleteExtension('Product'),
    service: softDeleteExtension('Service'),
    opportunity: softDeleteExtension('Opportunity'),
    adminRole: softDeleteExtension('AdminRole'),
  },
});

function escapeLiteral(value: string): string {
  // Simple Postgres literal escaping for GUC string values.
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "''");
  return `'${escaped}'`;
}

export async function disconnectPrisma(): Promise<void> {
  await basePrisma.$disconnect();
}
