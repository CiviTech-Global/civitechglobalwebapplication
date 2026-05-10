import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';

export function requirePermission(...perms: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    let userPermissions = req.user.permissions || [];

    // Fallback: if token was issued before permissions were added, fetch from DB
    if (req.user.role === 'ADMIN' && userPermissions.length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { permissions: true },
      });
      if (user) {
        userPermissions = user.permissions;
        req.user.permissions = userPermissions;
      }
    }

    if (req.user.role === 'ADMIN' && userPermissions.some((p) => perms.includes(p))) {
      next();
      return;
    }

    res.status(403).json({ success: false, message: 'Insufficient permissions' });
  };
}
