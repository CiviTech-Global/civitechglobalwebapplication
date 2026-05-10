import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getUsers(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const search = query.search as string | undefined;
  const role = query.role as string | undefined;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, phone: true, avatar: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, phone: true, avatar: true, createdAt: true,
      _count: { select: { orders: true, tickets: true, opportunityApplications: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function updateProfile(id: string, data: Record<string, unknown>) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({
    where: { id }, data: data as any,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, phone: true, avatar: true, createdAt: true },
  });
}

export async function updateUserRole(id: string, role: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({
    where: { id }, data: { role: role as any },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, createdAt: true },
  });
}

export async function updateUserPermissions(id: string, permissions: string[]) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({
    where: { id },
    data: { permissions },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, createdAt: true },
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.delete({ where: { id } });
}
