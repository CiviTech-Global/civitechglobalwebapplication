import { describe, it, expect } from 'vitest';
import { orderListQuerySchema } from './order.schema.js';

describe('orderListQuerySchema', () => {
  it('accepts valid status filter', () => {
    const result = orderListQuerySchema.parse({ page: '1', limit: '20', status: 'COMPLETED' });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.status).toBe('COMPLETED');
  });

  it('rejects invalid status filter', () => {
    const result = orderListQuerySchema.safeParse({ status: 'SHIPPED' });
    expect(result.success).toBe(false);
  });

  it('handles repeated status param', () => {
    const result = orderListQuerySchema.parse({ status: ['PENDING', 'CONFIRMED'] });
    expect(result.status).toBe('PENDING');
  });
});
