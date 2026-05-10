import { Router } from 'express';
import * as opportunityController from '../controllers/opportunity.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createOpportunitySchema, updateOpportunitySchema, applyOpportunitySchema } from '../validators/opportunity.schema.js';

const router = Router();

// Authenticated user (before /:slug to avoid conflict)
router.get('/user/applications', authenticate, opportunityController.getUserApplications);

// Admin (before /:slug to avoid conflict)
router.get('/admin/all', authenticate, requirePermission('opportunities'), opportunityController.getAllOpportunities);
router.get('/admin/applications', authenticate, requirePermission('opportunities'), opportunityController.getApplications);
router.put('/admin/applications/:id', authenticate, requirePermission('opportunities'), opportunityController.updateApplicationStatus);

// Public
router.get('/', opportunityController.getOpportunities);
router.get('/:slug', opportunityController.getOpportunity);

// Authenticated user
router.post('/:id/apply', authenticate, validate(applyOpportunitySchema), opportunityController.apply);

// Admin CRUD
router.post('/', authenticate, requirePermission('opportunities'), validate(createOpportunitySchema), opportunityController.createOpportunity);
router.put('/:id', authenticate, requirePermission('opportunities'), validate(updateOpportunitySchema), opportunityController.updateOpportunity);
router.delete('/:id', authenticate, requirePermission('opportunities'), opportunityController.deleteOpportunity);

export default router;
