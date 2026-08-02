import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_REQUIREMENTS,
  PASSWORD_COMPLEXITY_MESSAGE,
} from '../utils/passwordPolicy.js';

const roleListRegex = /^(USER|ADMIN|SUPER_ADMIN)(,(USER|ADMIN|SUPER_ADMIN))*$/;

export const userListQuerySchema = paginationQuerySchema.extend({
  role: z.preprocess((val) => (Array.isArray(val) ? val[0] : val), z.string().regex(roleListRegex)).optional(),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;

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
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, PASSWORD_COMPLEXITY_MESSAGE)
    .max(PASSWORD_MAX_LENGTH, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.lowercase, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.uppercase, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.digit, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.special, PASSWORD_COMPLEXITY_MESSAGE),
  adminRoleId: z.string().optional(),
});
