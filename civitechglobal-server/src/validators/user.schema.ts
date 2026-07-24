import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
});

export const updatePermissionsSchema = z.object({
  permissions: z.array(z.string().min(1).max(100)).max(50),
});

export const assignAdminRoleSchema = z.object({
  adminRoleId: z.string().uuid(),
});

export const createAdminSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  adminRoleId: z.string().optional(),
});
