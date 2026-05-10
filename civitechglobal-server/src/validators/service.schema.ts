import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive().optional().nullable(),
  image: z.string().optional(),
  category: z.string().optional(),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();
