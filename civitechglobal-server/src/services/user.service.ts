import crypto from 'node:crypto';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword } from '../utils/password.js';

export async function getUsers(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const search = query.search as string | undefined;
  const role = query.role as string | undefined;

  const where: Record<string, unknown> = {};
  if (role) {
    const roles = role.split(',').map((r) => r.trim());
    where.role = roles.length === 1 ? roles[0] : { in: roles };
  }
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

export async function createAdmin(data: { email: string; firstName: string; lastName: string; adminRoleId?: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Email already in use', 409);

  // Auto-generate username from email prefix + random digits
  const emailPrefix = data.email.split('@')[0];
  const randomDigits = crypto.randomInt(1000, 9999).toString();
  const username = `${emailPrefix}_${randomDigits}`;
  // Auto-generate a random 12-char password
  const rawPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12);
  const hashedPassword = await hashPassword(rawPassword);

  // If a role is assigned, fetch its permissions
  let permissions: string[] = [];
  if (data.adminRoleId) {
    const role = await prisma.adminRole.findUnique({ where: { id: data.adminRoleId } });
    if (role) permissions = role.permissions;
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'ADMIN',
      permissions,
      adminRoleId: data.adminRoleId || null,
    },
    select: { id: true, email: true, username: true, firstName: true, lastName: true, role: true, permissions: true, adminRoleId: true, createdAt: true },
  });

  return { ...user, generatedPassword: rawPassword };
}

export async function assignAdminRole(userId: string, adminRoleId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const role = await prisma.adminRole.findUnique({ where: { id: adminRoleId } });
  if (!role) throw new AppError('Role not found', 404);

  return prisma.user.update({
    where: { id: userId },
    data: { adminRoleId, permissions: role.permissions },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, adminRoleId: true, createdAt: true },
  });
}
