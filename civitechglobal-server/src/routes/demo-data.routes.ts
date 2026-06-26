import { Router } from 'express';
import * as demoDataController from '../controllers/demo-data.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/status', demoDataController.getDemoStatus);
router.post('/seed', demoDataController.seedDemoData);
router.delete('/clear', demoDataController.clearDemoData);

export default router;
