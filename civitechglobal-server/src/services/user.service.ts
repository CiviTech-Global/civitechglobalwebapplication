import crypto from 'node:crypto';
import { Prisma, Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword } from '../utils/password.js';
import { assertPasswordStrong } from '../utils/passwordPolicy.js';
import { encrypt, encryptRequired, hashForSearch, normalizeEmail, normalizePhone } from '../utils/pii.js';
import { userRepository, adminRoleRepository } from '../database/prisma/repositories/user.repository.js';
import type { UserListQuery } from '../validators/user.schema.js';
import { decryptUser, decryptUsers } from '../utils/piiTransform.js';

function isEmail(value: string): boolean {
  return value.includes('@');
}

function userSelect() {
  return {
    id: true,
    email: true,
    emailHash: true,
    username: true,
    firstName: true,
    lastName: true,
    role: true,
    permissions: true,
    phone: true,
    phoneHash: true,
    avatar: true,
    createdAt: true,
  } as const;
}

export async function getUsers(query: UserListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const search = query.search;
  const role = query.role;

  const where: Record<string, unknown> = {};
  if (role) {
    const roles = role.split(',').map((r) => r.trim());
    where.role = roles.length === 1 ? roles[0] : { in: roles };
  }
  if (search) {
    if (isEmail(search)) {
      where.emailHash = hashForSearch(normalizeEmail(search));
    } else {
      where.username = { contains: search, mode: 'insensitive' };
    }
  }

  const [users, total] = await Promise.all([
    userRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: userSelect(),
    }),
    userRepository.count({ where }),
  ]);

  return { users: decryptUsers(users), total, page, limit };
}

export async function getUserById(id: string) {
  const user = await userRepository.findUnique({
    where: { id },
    select: {
      ...userSelect(),
      _count: { select: { orders: true, tickets: true, opportunityApplications: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return decryptUser(user);
}

export async function updateProfile(id: string, data: Record<string, unknown>) {
  const allowedFields: Record<string, unknown> = {};
  if (data.firstName !== undefined) allowedFields.firstName = encryptRequired(String(data.firstName));
  if (data.lastName !== undefined) allowedFields.lastName = encryptRequired(String(data.lastName));
  if (data.phone !== undefined) {
    const phone = String(data.phone);
    allowedFields.phone = encrypt(phone);
    allowedFields.phoneHash = phone ? hashForSearch(normalizePhone(phone)) : null;
  }
  if (data.avatar !== undefined) allowedFields.avatar = data.avatar;

  const user = await userRepository.update({
    where: { id },
    data: allowedFields as Prisma.UserUpdateInput,
    select: userSelect(),
  });

  return decryptUser(user);
}

export async function updateUserRole(id: string, role: string) {
  const user = await userRepository.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  // Revoke all tokens when role changes
  const { revokeAllUserRefreshTokens } = await import('./auth.service.js');
  await revokeAllUserRefreshTokens(id);
  const updated = await userRepository.update({
    where: { id },
    data: { role: role as Role },
    select: userSelect(),
  });
  return decryptUser(updated);
}

export async function updateUserPermissions(id: string, permissions: string[]) {
  const user = await userRepository.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  // Revoke all tokens when permissions change
  const { revokeAllUserRefreshTokens } = await import('./auth.service.js');
  await revokeAllUserRefreshTokens(id);
  const updated = await userRepository.update({
    where: { id },
    data: { permissions },
    select: userSelect(),
  });
  return decryptUser(updated);
}

export async function deleteUser(id: string) {
  const user = await userRepository.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  await userRepository.update({ where: { id }, data: { deletedAt: new Date() } });
  return { success: true };
}

export async function createAdmin(data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  adminRoleId?: string;
}) {
  assertPasswordStrong(data.password, 'password');

  const emailHash = hashForSearch(normalizeEmail(data.email));
  const existing = await userRepository.findFirst({ where: { emailHash: emailHash ?? undefined } });
  if (existing) throw new AppError('Email already in use', 409);

  // Auto-generate username from email prefix + random digits
  const emailPrefix = data.email.split('@')[0];
  const randomDigits = crypto.randomInt(1000, 9999).toString();
  const username = `${emailPrefix}_${randomDigits}`;
  const hashedPassword = await hashPassword(data.password);

  // If a role is assigned, fetch its permissions
  let permissions: string[] = [];
  if (data.adminRoleId) {
    const role = await adminRoleRepository.findUnique({ where: { id: data.adminRoleId } });
    if (role) permissions = role.permissions;
  }

  const user = await userRepository.create({
    data: {
      email: encryptRequired(data.email),
      emailHash,
      username,
      password: hashedPassword,
      firstName: encryptRequired(data.firstName),
      lastName: encryptRequired(data.lastName),
      role: 'ADMIN',
      permissions,
      adminRoleId: data.adminRoleId || null,
    },
    select: {
      ...userSelect(),
      adminRoleId: true,
    },
  });

  const decryptedUser = decryptUser(user);
  if (!decryptedUser) throw new AppError('Failed to create admin', 500);

  return decryptedUser;
}

export async function assignAdminRole(userId: string, adminRoleId: string) {
  const user = await userRepository.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const role = await adminRoleRepository.findUnique({ where: { id: adminRoleId } });
  if (!role) throw new AppError('Role not found', 404);

  const updated = await userRepository.update({
    where: { id: userId },
    data: { adminRoleId, permissions: role.permissions },
    select: {
      ...userSelect(),
      adminRoleId: true,
    },
  });

  return decryptUser(updated);
}
