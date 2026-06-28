import { Router } from 'express';
import * as leadController from '../controllers/lead.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { updateLeadStatusSchema } from '../validators/lead.schema.js';

const router = Router();

router.get('/stats', authenticate, requirePermission('leads'), leadController.getLeadStats);
router.get('/', authenticate, requirePermission('leads'), leadController.getAllLeads);
router.get('/:id', authenticate, requirePermission('leads'), leadController.getLead);
router.put(
  '/:id/status',
  authenticate,
  requirePermission('leads'),
  validate(updateLeadStatusSchema),
  leadController.updateLeadStatus,
);

export default router;
