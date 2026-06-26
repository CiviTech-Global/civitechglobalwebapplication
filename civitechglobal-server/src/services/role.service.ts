import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getRoles() {
  return prisma.adminRole.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { users: true } } },
  });
}

export async function getRoleById(id: string) {
  const role = await prisma.adminRole.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) throw new AppError('Role not found', 404);
  return role;
}

export async function createRole(data: { name: string; permissions: string[] }) {
  const existing = await prisma.adminRole.findUnique({ where: { name: data.name } });
  if (existing) throw new AppError('Role with this name already exists', 409);
  return prisma.adminRole.create({ data });
}

export async function updateRole(id: string, data: { name?: string; permissions?: string[] }) {
  const role = await prisma.adminRole.findUnique({ where: { id } });
  if (!role) throw new AppError('Role not found', 404);
  if (data.name && data.name !== role.name) {
    const existing = await prisma.adminRole.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError('Role with this name already exists', 409);
  }
  return prisma.adminRole.update({ where: { id }, data });
}

export async function deleteRole(id: string) {
  const role = await prisma.adminRole.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) throw new AppError('Role not found', 404);
  if (role._count.users > 0) throw new AppError('Cannot delete role with assigned users', 400);
  return prisma.adminRole.delete({ where: { id } });
}
