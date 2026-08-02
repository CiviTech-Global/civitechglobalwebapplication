import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

export const leadListQuerySchema = paginationQuerySchema.extend({
  status: z
    .preprocess(
      (val) => (Array.isArray(val) ? val[0] : val),
      z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    )
    .optional(),
});

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});
