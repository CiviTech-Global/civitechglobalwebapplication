import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import serviceRoutes from './service.routes.js';
import opportunityRoutes from './opportunity.routes.js';
import orderRoutes from './order.routes.js';
import ticketRoutes from './ticket.routes.js';
import userRoutes from './user.routes.js';
import contentRoutes from './content.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/orders', orderRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/content', contentRoutes);
router.use('/admin/dashboard', dashboardRoutes);

export default router;
