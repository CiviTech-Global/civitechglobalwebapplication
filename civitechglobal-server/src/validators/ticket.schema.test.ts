import { describe, it, expect } from 'vitest';
import { ticketListQuerySchema } from './ticket.schema.js';

describe('ticketListQuerySchema', () => {
  it('accepts status and priority filters', () => {
    const result = ticketListQuerySchema.parse({ page: '1', limit: '25', status: 'OPEN', priority: 'HIGH' });
    expect(result.status).toBe('OPEN');
    expect(result.priority).toBe('HIGH');
  });

  it('rejects invalid status', () => {
    const result = ticketListQuerySchema.safeParse({ status: 'DELETED' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const result = ticketListQuerySchema.safeParse({ priority: 'CRITICAL' });
    expect(result.success).toBe(false);
  });
});
