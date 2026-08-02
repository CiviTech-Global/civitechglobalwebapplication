import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { serviceRepository } from '../database/prisma/repositories/service.repository.js';
import type { ServiceListQuery } from '../validators/service.schema.js';

export async function getServices(query: ServiceListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const category = query.category;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;

  const [services, total] = await Promise.all([
    serviceRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    serviceRepository.count({ where }),
  ]);

  return { services, total, page, limit };
}

export async function getServiceBySlug(slug: string) {
  const service = await serviceRepository.findUnique({ where: { slug } });
  if (!service) throw new AppError('Service not found', 404);
  return service;
}

export async function createService(data: Record<string, unknown>) {
  return serviceRepository.create({ data: data as Prisma.ServiceCreateInput });
}

export async function updateService(id: string, data: Record<string, unknown>) {
  const service = await serviceRepository.findUnique({ where: { id } });
  if (!service) throw new AppError('Service not found', 404);
  return serviceRepository.update({ where: { id }, data: data as Prisma.ServiceUpdateInput });
}

export async function deleteService(id: string) {
  const service = await serviceRepository.findUnique({ where: { id } });
  if (!service) throw new AppError('Service not found', 404);
  return serviceRepository.update({ where: { id }, data: { deletedAt: new Date() } });
}
