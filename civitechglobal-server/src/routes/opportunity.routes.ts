import { Router } from 'express';
import * as opportunityController from '../controllers/opportunity.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  applyOpportunitySchema,
  opportunityListQuerySchema,
  adminOpportunityListQuerySchema,
  applicationListQuerySchema,
} from '../validators/opportunity.schema.js';
import { slugParamSchema, uuidParamSchema } from '../validators/common.schema.js';

const router = Router();

// Authenticated user (before /:slug to avoid conflict)
router.get('/user/applications', authenticate, opportunityController.getUserApplications);

// Admin (before /:slug to avoid conflict)
router.get(
  '/admin/all',
  authenticate,
  requirePermission('opportunities'),
  validate({ query: adminOpportunityListQuerySchema }),
  opportunityController.getAllOpportunities,
);
router.get(
  '/admin/applications',
  authenticate,
  requirePermission('opportunities'),
  validate({ query: applicationListQuerySchema }),
  opportunityController.getApplications,
);
router.put(
  '/admin/applications/:id',
  authenticate,
  requirePermission('opportunities'),
  validate({ params: uuidParamSchema }),
  opportunityController.updateApplicationStatus,
);

// Public
router.get('/', validate({ query: opportunityListQuerySchema }), opportunityController.getOpportunities);
router.get('/:slug', validate({ params: slugParamSchema }), opportunityController.getOpportunity);

// Authenticated user
router.post(
  '/:id/apply',
  authenticate,
  validate({ params: uuidParamSchema, body: applyOpportunitySchema }),
  opportunityController.apply,
);

// Admin CRUD
router.post(
  '/',
  authenticate,
  requirePermission('opportunities'),
  validate(createOpportunitySchema),
  opportunityController.createOpportunity,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('opportunities'),
  validate({ params: uuidParamSchema, body: updateOpportunitySchema }),
  opportunityController.updateOpportunity,
);
router.delete(
  '/:id',
  authenticate,
  requirePermission('opportunities'),
  validate({ params: uuidParamSchema }),
  opportunityController.deleteOpportunity,
);

export default router;
