import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, updateRoleSchema } from '../validators/user.schema.js';

const router = Router();

router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.get('/', authenticate, requirePermission('users'), userController.getUsers);
router.get('/:id', authenticate, requirePermission('users'), userController.getUser);
router.put('/:id', authenticate, requirePermission('users'), validate(updateProfileSchema), userController.updateProfile);
router.put('/:id/role', authenticate, authorize('SUPER_ADMIN'), validate(updateRoleSchema), userController.updateRole);
router.put('/:id/permissions', authenticate, authorize('SUPER_ADMIN'), userController.updatePermissions);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), userController.deleteUser);

export default router;
