import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema, orderListQuerySchema } from '../validators/order.schema.js';
import { uuidParamSchema } from '../validators/common.schema.js';
import { paginationQuerySchema } from '../validators/common.schema.js';

const router = Router();

router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/my', authenticate, validate({ query: paginationQuerySchema }), orderController.getUserOrders);
router.get('/:id', authenticate, validate({ params: uuidParamSchema }), orderController.getOrder);
router.get(
  '/',
  authenticate,
  requirePermission('orders'),
  validate({ query: orderListQuerySchema }),
  orderController.getAllOrders,
);
router.put(
  '/:id/status',
  authenticate,
  requirePermission('orders'),
  validate({ params: uuidParamSchema, body: updateOrderStatusSchema }),
  orderController.updateOrderStatus,
);

export default router;
