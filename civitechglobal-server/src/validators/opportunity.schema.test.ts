import { describe, it, expect } from 'vitest';
import {
  opportunityListQuerySchema,
  adminOpportunityListQuerySchema,
  applicationListQuerySchema,
} from './opportunity.schema.js';

describe('opportunityListQuerySchema', () => {
  it('accepts valid type filter', () => {
    const result = opportunityListQuerySchema.parse({ page: '2', limit: '10', type: 'JOB' });
    expect(result.page).toBe(2);
    expect(result.type).toBe('JOB');
  });

  it('rejects invalid type filter', () => {
    const result = opportunityListQuerySchema.safeParse({ type: 'CONTRACT' });
    expect(result.success).toBe(false);
  });
});

describe('adminOpportunityListQuerySchema', () => {
  it('applies pagination defaults', () => {
    const result = adminOpportunityListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});

describe('applicationListQuerySchema', () => {
  it('accepts valid status filter', () => {
    const result = applicationListQuerySchema.parse({ status: 'REVIEWING' });
    expect(result.status).toBe('REVIEWING');
  });

  it('rejects invalid status filter', () => {
    const result = applicationListQuerySchema.safeParse({ status: 'SPAM' });
    expect(result.success).toBe(false);
  });
});
