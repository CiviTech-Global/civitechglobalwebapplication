import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).min(1),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).min(1).optional(),
});
