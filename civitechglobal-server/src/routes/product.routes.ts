import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema, productListQuerySchema } from '../validators/product.schema.js';
import { slugParamSchema, uuidParamSchema } from '../validators/common.schema.js';

const router = Router();

router.get('/', validate({ query: productListQuerySchema }), productController.getProducts);
router.get('/:slug', validate({ params: slugParamSchema }), productController.getProduct);
router.post(
  '/',
  authenticate,
  requirePermission('products'),
  validate(createProductSchema),
  productController.createProduct,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('products'),
  validate({ params: uuidParamSchema, body: updateProductSchema }),
  productController.updateProduct,
);
router.delete(
  '/:id',
  authenticate,
  requirePermission('products'),
  validate({ params: uuidParamSchema }),
  productController.deleteProduct,
);

export default router;
