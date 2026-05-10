import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getOpportunities(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const type = query.type as string | undefined;

  const where: Record<string, unknown> = { isOpen: true };
  if (type) where.opportunityType = type;

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.opportunity.count({ where }),
  ]);

  return { opportunities, total, page, limit };
}

export async function getAllOpportunities(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { _count: { select: { applications: true } } } }),
    prisma.opportunity.count(),
  ]);

  return { opportunities, total, page, limit };
}

export async function getOpportunityBySlug(slug: string) {
  const opportunity = await prisma.opportunity.findUnique({ where: { slug } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  return opportunity;
}

export async function createOpportunity(data: Record<string, unknown>) {
  return prisma.opportunity.create({ data: data as any });
}

export async function updateOpportunity(id: string, data: Record<string, unknown>) {
  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  return prisma.opportunity.update({ where: { id }, data: data as any });
}

export async function deleteOpportunity(id: string) {
  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  return prisma.opportunity.delete({ where: { id } });
}

export async function applyToOpportunity(userId: string, opportunityId: string, data: { coverLetter: string; resumeUrl?: string }) {
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  if (!opportunity.isOpen) throw new AppError('This opportunity is no longer accepting applications', 400);

  const existing = await prisma.opportunityApplication.findUnique({
    where: { userId_opportunityId: { userId, opportunityId } },
  });
  if (existing) throw new AppError('You have already applied to this opportunity', 409);

  return prisma.opportunityApplication.create({
    data: { userId, opportunityId, ...data },
    include: { opportunity: true },
  });
}

export async function getApplications(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const status = query.status as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.opportunityApplication.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } }, opportunity: { select: { id: true, title: true, opportunityType: true } } },
    }),
    prisma.opportunityApplication.count({ where }),
  ]);

  return { applications, total, page, limit };
}

export async function getUserApplications(userId: string) {
  return prisma.opportunityApplication.findMany({
    where: { userId },
    include: { opportunity: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateApplicationStatus(id: string, status: string) {
  const application = await prisma.opportunityApplication.findUnique({ where: { id } });
  if (!application) throw new AppError('Application not found', 404);
  return prisma.opportunityApplication.update({ where: { id }, data: { status: status as any } });
}
