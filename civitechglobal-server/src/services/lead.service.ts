import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { LeadStatus } from '@prisma/client';

export async function getAllLeads(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const status = query.status as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, title: true, emoji: true } },
        subcategory: { select: { id: true, title: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, limit };
}

export async function getLeadById(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, title: true, emoji: true } },
      subcategory: { select: { id: true, title: true } },
    },
  });

  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new AppError('Lead not found', 404);

  return prisma.lead.update({
    where: { id },
    data: { status },
    include: {
      category: { select: { id: true, title: true, emoji: true } },
      subcategory: { select: { id: true, title: true } },
    },
  });
}

export async function getLeadStats() {
  const [total, newLeads, contacted, inProgress, completed, cancelled] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'CONTACTED' } }),
    prisma.lead.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.lead.count({ where: { status: 'COMPLETED' } }),
    prisma.lead.count({ where: { status: 'CANCELLED' } }),
  ]);

  return { total, newLeads, contacted, inProgress, completed, cancelled };
}
