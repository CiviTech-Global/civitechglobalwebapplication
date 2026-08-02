import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from './validate.js';

function createReq(partial: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    ...partial,
  } as Request;
}

function createRes(): Response {
  return {} as Response;
}

describe('validate middleware', () => {
  it('validates body and sanitizes strings', () => {
    const schema = z.object({ name: z.string() });
    const req = createReq({ body: { name: '<script>alert(1)</script>' } });
    const next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };

    validate(schema)(req, createRes(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
    expect(req.body.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('validates query and replaces req.query with parsed data', () => {
    const schema = z.object({ page: z.coerce.number().default(1) });
    const req = createReq({ query: { page: '3' } });
    const next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };

    validate({ query: schema })(req, createRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query.page).toBe(3);
  });

  it('validates route params', () => {
    const schema = z.object({ id: z.string().uuid() });
    const req = createReq({ params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };

    validate({ params: schema })(req, createRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.params.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('calls next with a 400 error when body validation fails', () => {
    const schema = z.object({ name: z.string().min(1) });
    const req = createReq({ body: { name: '' } });
    const next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };

    validate(schema)(req, createRes(), next as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    const err = next.mock.calls[0][0] as Error & { statusCode: number; errors: unknown[] };
    expect(err.statusCode).toBe(400);
    expect(err.errors.length).toBeGreaterThan(0);
  });

  it('calls next with a 400 error when query validation fails', () => {
    const schema = z.object({ page: z.coerce.number().min(1) });
    const req = createReq({ query: { page: 'abc' } });
    const next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };

    validate({ query: schema })(req, createRes(), next);

    const err = next.mock.calls[0][0] as Error & { statusCode: number };
    expect(err.statusCode).toBe(400);
  });

  it('calls next with a 400 error when params validation fails', () => {
    const schema = z.object({ id: z.string().uuid() });
    const req = createReq({ params: { id: 'not-a-uuid' } });
    const next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };

    validate({ params: schema })(req, createRes(), next);

    const err = next.mock.calls[0][0] as Error & { statusCode: number };
    expect(err.statusCode).toBe(400);
  });
});
