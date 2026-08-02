import { AppError } from '../middleware/errorHandler.js';
import type { LeadStatus } from '@prisma/client';
import { decryptLead, decryptLeads } from '../utils/piiTransform.js';
import { leadRepository } from '../database/prisma/repositories/lead.repository.js';
import type { LeadListQuery } from '../validators/lead.schema.js';

export async function getAllLeads(query: LeadListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const status = query.status;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [leads, total] = await Promise.all([
    leadRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, title: true, emoji: true } },
        subcategory: { select: { id: true, title: true } },
      },
    }),
    leadRepository.count({ where }),
  ]);

  return { leads: decryptLeads(leads), total, page, limit };
}

export async function getLeadById(id: string) {
  const lead = await leadRepository.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, title: true, emoji: true } },
      subcategory: { select: { id: true, title: true } },
    },
  });

  if (!lead) throw new AppError('Lead not found', 404);
  return decryptLead(lead);
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const lead = await leadRepository.findUnique({ where: { id } });
  if (!lead) throw new AppError('Lead not found', 404);

  const updated = await leadRepository.update({
    where: { id },
    data: { status },
    include: {
      category: { select: { id: true, title: true, emoji: true } },
      subcategory: { select: { id: true, title: true } },
    },
  });
  return decryptLead(updated);
}

export async function getLeadStats() {
  const [total, newLeads, contacted, inProgress, completed, cancelled] = await Promise.all([
    leadRepository.count(),
    leadRepository.count({ where: { status: 'NEW' } }),
    leadRepository.count({ where: { status: 'CONTACTED' } }),
    leadRepository.count({ where: { status: 'IN_PROGRESS' } }),
    leadRepository.count({ where: { status: 'COMPLETED' } }),
    leadRepository.count({ where: { status: 'CANCELLED' } }),
  ]);

  return { total, newLeads, contacted, inProgress, completed, cancelled };
}
