import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';

const router = Router();

router.get('/', authenticate, requirePermission('analytics'), dashboardController.getAdminDashboard);

export default router;
