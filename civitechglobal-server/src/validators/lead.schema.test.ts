import { describe, it, expect } from 'vitest';
import { leadListQuerySchema } from './lead.schema.js';

describe('leadListQuerySchema', () => {
  it('accepts valid status filter', () => {
    const result = leadListQuerySchema.parse({ page: '2', limit: '15', status: 'IN_PROGRESS' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(15);
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('rejects invalid status filter', () => {
    const result = leadListQuerySchema.safeParse({ status: 'LOST' });
    expect(result.success).toBe(false);
  });
});
