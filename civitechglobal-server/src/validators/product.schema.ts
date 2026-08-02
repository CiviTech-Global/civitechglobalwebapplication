import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

export const productListQuerySchema = paginationQuerySchema.extend({
  category: z.preprocess((val) => (Array.isArray(val) ? val[0] : val), z.string().trim().max(100)).optional(),
  search: z.preprocess((val) => (Array.isArray(val) ? val[0] : val), z.string().trim().max(200)).optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

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
