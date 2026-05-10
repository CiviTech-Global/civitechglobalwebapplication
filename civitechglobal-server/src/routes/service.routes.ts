import { Router } from 'express';
import * as serviceController from '../controllers/service.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema, updateServiceSchema } from '../validators/service.schema.js';

const router = Router();

router.get('/', serviceController.getServices);
router.get('/:slug', serviceController.getService);
router.post('/', authenticate, requirePermission('services'), validate(createServiceSchema), serviceController.createService);
router.put('/:id', authenticate, requirePermission('services'), validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authenticate, requirePermission('services'), serviceController.deleteService);

export default router;
