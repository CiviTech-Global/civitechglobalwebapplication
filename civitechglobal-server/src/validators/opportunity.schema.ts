import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

export const opportunityListQuerySchema = paginationQuerySchema.extend({
  type: z.preprocess((val) => (Array.isArray(val) ? val[0] : val), z.enum(['JOB', 'INTERNSHIP'])).optional(),
});

export type OpportunityListQuery = z.infer<typeof opportunityListQuerySchema>;

export const adminOpportunityListQuerySchema = paginationQuerySchema;
export type AdminOpportunityListQuery = z.infer<typeof adminOpportunityListQuerySchema>;

export const applicationListQuerySchema = paginationQuerySchema.extend({
  status: z
    .preprocess((val) => (Array.isArray(val) ? val[0] : val), z.enum(['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED']))
    .optional(),
});

export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;

export const createOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).default([]),
  duration: z.string().min(1, 'Duration is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().default('Remote'),
  opportunityType: z.enum(['JOB', 'INTERNSHIP']).default('INTERNSHIP'),
  isOpen: z.boolean().default(true),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const applyOpportunitySchema = z.object({
  coverLetter: z.string().min(10, 'Cover letter must be at least 10 characters'),
  resumeUrl: z.string().url().optional(),
});
