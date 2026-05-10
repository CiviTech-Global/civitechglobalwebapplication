import { Router } from 'express';
import * as contentController from '../controllers/content.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { updateContentSchema } from '../validators/content.schema.js';

const router = Router();

router.get('/', contentController.getAllContent);
router.get('/:key', contentController.getContent);
router.put('/:key', authenticate, requirePermission('content'), validate(updateContentSchema), contentController.updateContent);

export default router;
