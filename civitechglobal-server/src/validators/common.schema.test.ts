import { describe, it, expect } from 'vitest';
import { paginationQuerySchema, uuidParamSchema } from './common.schema.js';

describe('paginationQuerySchema', () => {
  it('applies defaults for empty query', () => {
    const result = paginationQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('coerces string page and limit', () => {
    const result = paginationQuerySchema.parse({ page: '2', limit: '25' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(25);
  });

  it('handles repeated query params by taking the first value', () => {
    const result = paginationQuerySchema.parse({ page: ['3', '4'], limit: ['15', '99'] });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(15);
  });

  it('rejects limit above 50', () => {
    const result = paginationQuerySchema.safeParse({ limit: '100' });
    expect(result.success).toBe(false);
  });

  it('rejects page below 1', () => {
    const result = paginationQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('trims and keeps search', () => {
    const result = paginationQuerySchema.parse({ search: '  alice  ' });
    expect(result.search).toBe('alice');
  });
});

describe('uuidParamSchema', () => {
  it('accepts a valid UUID', () => {
    const result = uuidParamSchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects an invalid UUID', () => {
    const result = uuidParamSchema.safeParse({ id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});
