import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

export const ticketListQuerySchema = paginationQuerySchema.extend({
  status: z
    .preprocess((val) => (Array.isArray(val) ? val[0] : val), z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']))
    .optional(),
  priority: z
    .preprocess((val) => (Array.isArray(val) ? val[0] : val), z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']))
    .optional(),
});

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.string().optional(),
  productId: z.string().optional(),
});

export const ticketMessageSchema = z.object({
  content: z.string().min(1, 'Message is required'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});
