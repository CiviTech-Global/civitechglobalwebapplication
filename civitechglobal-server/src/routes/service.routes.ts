import { Router } from 'express';
import * as serviceController from '../controllers/service.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema, updateServiceSchema, serviceListQuerySchema } from '../validators/service.schema.js';
import { slugParamSchema, uuidParamSchema } from '../validators/common.schema.js';

const router = Router();

router.get('/', validate({ query: serviceListQuerySchema }), serviceController.getServices);
router.get('/:slug', validate({ params: slugParamSchema }), serviceController.getService);
router.post(
  '/',
  authenticate,
  requirePermission('services'),
  validate(createServiceSchema),
  serviceController.createService,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('services'),
  validate({ params: uuidParamSchema, body: updateServiceSchema }),
  serviceController.updateService,
);
router.delete(
  '/:id',
  authenticate,
  requirePermission('services'),
  validate({ params: uuidParamSchema }),
  serviceController.deleteService,
);

export default router;
