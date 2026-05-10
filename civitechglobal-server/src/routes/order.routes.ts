import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.schema.js';

const router = Router();

router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/my', authenticate, orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrder);
router.get('/', authenticate, requirePermission('orders'), orderController.getAllOrders);
router.put('/:id/status', authenticate, requirePermission('orders'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
