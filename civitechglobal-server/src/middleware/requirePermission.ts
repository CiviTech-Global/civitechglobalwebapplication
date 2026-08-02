import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../database/prisma/repositories/user.repository.js';

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

    // Fallback: if token carried no permissions, fetch the latest set from the DB
    if (userPermissions.length === 0) {
      const user = await userRepository.findUnique({
        where: { id: req.user.userId },
        select: { permissions: true },
      });
      if (user) {
        userPermissions = user.permissions;
        req.user.permissions = userPermissions;
      }
    }

    if (userPermissions.some((p) => perms.includes(p))) {
      next();
      return;
    }

    res.status(403).json({ success: false, message: 'Insufficient permissions' });
  };
}
