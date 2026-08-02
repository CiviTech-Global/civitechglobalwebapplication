import { describe, it, expect } from 'vitest';
import { serviceListQuerySchema } from './service.schema.js';

describe('serviceListQuerySchema', () => {
  it('accepts pagination with category', () => {
    const result = serviceListQuerySchema.parse({ page: '1', limit: '15', category: 'Insurance' });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(15);
    expect(result.category).toBe('Insurance');
  });

  it('rejects overly long category values', () => {
    const result = serviceListQuerySchema.safeParse({ category: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});
