import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { getRequestContext, runWithContext, runAsSystem, runAsPublic, setRequestContext } from './requestContext.js';

describe('requestContext', () => {
  it('stores and retrieves context', async () => {
    const result = await runWithContext({ userId: 'user-1', role: 'USER' }, async () => {
      return getRequestContext();
    });
    expect(result).toEqual({ userId: 'user-1', role: 'USER' });
  });

  it('propagates context through async calls', async () => {
    await runWithContext({ userId: 'user-2', role: 'ADMIN' }, async () => {
      await Promise.resolve();
      await Promise.resolve();
      expect(getRequestContext()).toEqual({ userId: 'user-2', role: 'ADMIN' });
    });
  });

  it('runAsSystem sets SYSTEM role', async () => {
    await runAsSystem(async () => {
      expect(getRequestContext()).toEqual({ userId: '', role: 'SYSTEM' });
    });
  });

  it('runAsPublic sets PUBLIC role', async () => {
    await runAsPublic(async () => {
      expect(getRequestContext()).toEqual({ userId: '', role: 'PUBLIC' });
    });
  });

  it('setRequestContext middleware uses req.user when present', () => {
    const req = { user: { userId: 'user-3', role: 'USER' } } as unknown as Request;
    const res = {} as Response;
    let capturedContext: ReturnType<typeof getRequestContext>;
    const next = vi.fn(() => {
      capturedContext = getRequestContext();
    });

    setRequestContext(req, res, next);

    return new Promise<void>((resolve) => {
      setImmediate(() => {
        expect(next).toHaveBeenCalled();
        expect(capturedContext).toEqual({ userId: 'user-3', role: 'USER' });
        resolve();
      });
    });
  });

  it('setRequestContext middleware falls back to PUBLIC for anonymous requests', () => {
    const req = {} as Request;
    const res = {} as Response;
    let capturedContext: ReturnType<typeof getRequestContext>;
    const next = vi.fn(() => {
      capturedContext = getRequestContext();
    });

    setRequestContext(req, res, next);

    return new Promise<void>((resolve) => {
      setImmediate(() => {
        expect(next).toHaveBeenCalled();
        expect(capturedContext).toEqual({ userId: '', role: 'PUBLIC' });
        resolve();
      });
    });
  });
});
