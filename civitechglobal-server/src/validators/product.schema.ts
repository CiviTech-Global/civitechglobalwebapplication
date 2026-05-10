import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive').optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  features: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();
