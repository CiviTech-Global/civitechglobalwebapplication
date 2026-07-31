import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { Role } from '@prisma/client';
import { prisma } from '../config/database.js';
import { runAsSystem } from '../utils/requestContext.js';

async function loadUserFromToken(token: string) {
  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      role: true,
      permissions: true,
      tokenVersion: true,
      deletedAt: true,
      emailVerified: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new Error('User not found or inactive');
  }

  if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
    throw new Error('Token revoked');
  }

  return {
    userId: user.id,
    role: user.role as Role,
    permissions: user.permissions,
  };
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  runAsSystem(() => loadUserFromToken(token))
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    });
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    runAsSystem(() => loadUserFromToken(token))
      .then((user) => {
        req.user = user;
        next();
      })
      .catch(() => {
        // Token invalid or user inactive; continue without user
        next();
      });
  } else {
    next();
  }
}
