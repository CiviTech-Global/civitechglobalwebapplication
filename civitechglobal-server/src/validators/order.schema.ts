import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: z
    .preprocess(
      (val) => (Array.isArray(val) ? val[0] : val),
      z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    )
    .optional(),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});
