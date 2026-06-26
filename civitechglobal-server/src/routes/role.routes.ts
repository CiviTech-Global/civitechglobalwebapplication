import { Router } from 'express';
import * as roleController from '../controllers/role.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createRoleSchema, updateRoleSchema } from '../validators/role.schema.js';

const router = Router();

router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', validate(createRoleSchema), roleController.createRole);
router.put('/:id', validate(updateRoleSchema), roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export default router;
