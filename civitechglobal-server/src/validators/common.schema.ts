import { z } from 'zod';

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Preprocesses a query value that may be a string or an array of strings
 * (e.g. repeated query params) into a single value.
 */
function queryValue<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (Array.isArray(val) ? val[0] : val), schema);
}

/**
 * Shared pagination schema for list endpoints.
 * Coerces page/limit from query strings and enforces sane defaults/limits.
 */
export const paginationQuerySchema = z.object({
  page: queryValue(
    z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : val),
      z.coerce.number().int().min(1).default(1),
    ),
  ),
  limit: queryValue(
    z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : val),
      z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
    ),
  ),
  search: queryValue(z.string().trim().max(200)).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Shared UUID route-parameter schema.
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export type UuidParams = z.infer<typeof uuidParamSchema>;

/**
 * Shared slug route-parameter schema.
 */
export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export type SlugParams = z.infer<typeof slugParamSchema>;
