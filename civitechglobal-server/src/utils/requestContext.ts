import { AsyncLocalStorage } from 'async_hooks';
import type { Request, Response, NextFunction } from 'express';

export interface RequestContext {
  userId?: string;
  role?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function runWithContext<T>(context: RequestContext, fn: () => T | Promise<T>): Promise<T> {
  return storage.run(context, () => Promise.resolve(fn()));
}

export function runAsSystem<T>(fn: () => T | Promise<T>): Promise<T> {
  return runWithContext({ userId: '', role: 'SYSTEM' }, fn);
}

export function runAsPublic<T>(fn: () => T | Promise<T>): Promise<T> {
  return runWithContext({ userId: '', role: 'PUBLIC' }, fn);
}

export function setRequestContext(req: Request, _res: Response, next: NextFunction): void {
  const context: RequestContext = req.user
    ? { userId: req.user.userId, role: req.user.role }
    : { userId: '', role: 'PUBLIC' };

  storage.run(context, () => {
    try {
      next();
    } catch (error) {
      next(error as Error);
    }
  });
}
