import { describe, it, expect } from 'vitest';
import { userListQuerySchema } from './user.schema.js';

describe('userListQuerySchema', () => {
  it('accepts valid pagination and role', () => {
    const result = userListQuerySchema.parse({ page: '2', limit: '20', role: 'ADMIN,USER' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
    expect(result.role).toBe('ADMIN,USER');
  });

  it('accepts a single valid role', () => {
    const result = userListQuerySchema.parse({ role: 'SUPER_ADMIN' });
    expect(result.role).toBe('SUPER_ADMIN');
  });

  it('rejects invalid role values', () => {
    const result = userListQuerySchema.safeParse({ role: 'HACKER' });
    expect(result.success).toBe(false);
  });

  it('rejects mixed valid and invalid roles', () => {
    const result = userListQuerySchema.safeParse({ role: 'USER,HACKER' });
    expect(result.success).toBe(false);
  });

  it('handles repeated role query param', () => {
    const result = userListQuerySchema.parse({ role: ['ADMIN', 'USER'] });
    expect(result.role).toBe('ADMIN');
  });
});
