import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getServices(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const category = query.category as string | undefined;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;

  const [services, total] = await Promise.all([
    prisma.service.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.service.count({ where }),
  ]);

  return { services, total, page, limit };
}

export async function getServiceBySlug(slug: string) {
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) throw new AppError('Service not found', 404);
  return service;
}

export async function createService(data: Record<string, unknown>) {
  return prisma.service.create({ data: data as any });
}

export async function updateService(id: string, data: Record<string, unknown>) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new AppError('Service not found', 404);
  return prisma.service.update({ where: { id }, data: data as any });
}

export async function deleteService(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new AppError('Service not found', 404);
  return prisma.service.delete({ where: { id } });
}
