import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sanitizeObject } from '../utils/sanitize.js';

export type ValidationTarget = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

function formatErrors(error: ZodError) {
  return error.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));
}

function validationError(message: string, errors: ReturnType<typeof formatErrors>) {
  return Object.assign(new Error(message), { statusCode: 400, errors });
}

export function validate(schemaOrTarget: ZodSchema | ValidationTarget) {
  const target: ValidationTarget = schemaOrTarget instanceof ZodSchema ? { body: schemaOrTarget } : schemaOrTarget;

  return (req: Request, _res: Response, next: NextFunction) => {
    if (target.body) {
      const result = target.body.safeParse(req.body);
      if (!result.success) {
        return next(validationError('Validation failed', formatErrors(result.error)));
      }
      req.body = sanitizeObject(result.data);
    }

    if (target.query) {
      const result = target.query.safeParse(req.query);
      if (!result.success) {
        return next(validationError('Validation failed', formatErrors(result.error)));
      }
      req.query = result.data as unknown as Request['query'];
    }

    if (target.params) {
      const result = target.params.safeParse(req.params);
      if (!result.success) {
        return next(validationError('Validation failed', formatErrors(result.error)));
      }
      req.params = result.data as unknown as Request['params'];
    }

    next();
  };
}
