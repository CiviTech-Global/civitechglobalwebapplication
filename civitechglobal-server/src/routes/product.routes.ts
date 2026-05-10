import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/product.schema.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProduct);
router.post('/', authenticate, requirePermission('products'), validate(createProductSchema), productController.createProduct);
router.put('/:id', authenticate, requirePermission('products'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, requirePermission('products'), productController.deleteProduct);

export default router;
