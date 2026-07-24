import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { Role } from '@prisma/client';
import { prisma } from '../config/database.js';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    if (payload.tokenVersion !== undefined) {
      prisma.user
        .findUnique({ where: { id: payload.userId }, select: { tokenVersion: true } })
        .then((user) => {
          if (!user || user.tokenVersion !== payload.tokenVersion) {
            res.status(401).json({ success: false, message: 'Token revoked' });
            return;
          }
          req.user = { userId: payload.userId, role: payload.role as Role, permissions: payload.permissions || [] };
          next();
        })
        .catch(() => {
          res.status(401).json({ success: false, message: 'Invalid token' });
        });
    } else {
      req.user = { userId: payload.userId, role: payload.role as Role, permissions: payload.permissions || [] };
      next();
    }
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      req.user = { userId: payload.userId, role: payload.role as Role, permissions: payload.permissions || [] };
    } catch {
      // Token invalid, continue without user
    }
  }
  next();
}
