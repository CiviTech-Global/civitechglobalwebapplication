import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sanitizeObject } from '../utils/sanitize.js';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(Object.assign(new Error('Validation failed'), { statusCode: 400, errors }));
    }

    // Sanitize string inputs to mitigate stored XSS
    req.body = sanitizeObject(result.data);
    next();
  };
}
