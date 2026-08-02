import { Prisma, ApplicationStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { decryptUser } from '../utils/piiTransform.js';
import {
  opportunityRepository,
  opportunityApplicationRepository,
} from '../database/prisma/repositories/opportunity.repository.js';
import type {
  OpportunityListQuery,
  AdminOpportunityListQuery,
  ApplicationListQuery,
} from '../validators/opportunity.schema.js';

export async function getOpportunities(query: OpportunityListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const type = query.type;

  const where: Record<string, unknown> = { isOpen: true };
  if (type) where.opportunityType = type;

  const [opportunities, total] = await Promise.all([
    opportunityRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    opportunityRepository.count({ where }),
  ]);

  return { opportunities, total, page, limit };
}

export async function getAllOpportunities(query: AdminOpportunityListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;

  const [opportunities, total] = await Promise.all([
    opportunityRepository.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    }),
    opportunityRepository.count(),
  ]);

  return { opportunities, total, page, limit };
}

export async function getOpportunityBySlug(slug: string) {
  const opportunity = await opportunityRepository.findUnique({ where: { slug } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  return opportunity;
}

export async function createOpportunity(data: Record<string, unknown>) {
  return opportunityRepository.create({ data: data as Prisma.OpportunityCreateInput });
}

export async function updateOpportunity(id: string, data: Record<string, unknown>) {
  const opportunity = await opportunityRepository.findUnique({ where: { id } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  return opportunityRepository.update({ where: { id }, data: data as Prisma.OpportunityUpdateInput });
}

export async function deleteOpportunity(id: string) {
  const opportunity = await opportunityRepository.findUnique({ where: { id } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  return opportunityRepository.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function applyToOpportunity(
  userId: string,
  opportunityId: string,
  data: { coverLetter: string; resumeUrl?: string },
) {
  const opportunity = await opportunityRepository.findUnique({ where: { id: opportunityId } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  if (!opportunity.isOpen) throw new AppError('This opportunity is no longer accepting applications', 400);

  const existing = await opportunityApplicationRepository.findUnique({
    where: { userId_opportunityId: { userId, opportunityId } },
  });
  if (existing) throw new AppError('You have already applied to this opportunity', 409);

  return opportunityApplicationRepository.create({
    data: { userId, opportunityId, ...data },
    include: { opportunity: true },
  });
}

export async function getApplications(query: ApplicationListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const status = query.status;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    opportunityApplicationRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        opportunity: { select: { id: true, title: true, opportunityType: true } },
      },
    }),
    opportunityApplicationRepository.count({ where }),
  ]);

  return {
    applications: applications.map((a) => ({ ...a, user: a.user ? decryptUser(a.user) : null })),
    total,
    page,
    limit,
  };
}

export async function getUserApplications(userId: string) {
  return opportunityApplicationRepository.findMany({
    where: { userId },
    include: { opportunity: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateApplicationStatus(id: string, status: string) {
  const application = await opportunityApplicationRepository.findUnique({ where: { id } });
  if (!application) throw new AppError('Application not found', 404);
  return opportunityApplicationRepository.update({ where: { id }, data: { status: status as ApplicationStatus } });
}
