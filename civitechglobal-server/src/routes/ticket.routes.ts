import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import { authenticate, optionalAuth } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import {
  createTicketSchema,
  ticketMessageSchema,
  updateTicketStatusSchema,
  ticketListQuerySchema,
} from '../validators/ticket.schema.js';
import { paginationQuerySchema, uuidParamSchema } from '../validators/common.schema.js';

const router = Router();

router.post('/', optionalAuth, validate(createTicketSchema), ticketController.createTicket);
router.get('/my', authenticate, validate({ query: paginationQuerySchema }), ticketController.getUserTickets);
router.get('/:id', authenticate, validate({ params: uuidParamSchema }), ticketController.getTicket);
router.post(
  '/:id/messages',
  authenticate,
  validate({ params: uuidParamSchema, body: ticketMessageSchema }),
  ticketController.addMessage,
);
router.get(
  '/',
  authenticate,
  requirePermission('tickets'),
  validate({ query: ticketListQuerySchema }),
  ticketController.getAllTickets,
);
router.put(
  '/:id/status',
  authenticate,
  requirePermission('tickets'),
  validate({ params: uuidParamSchema, body: updateTicketStatusSchema }),
  ticketController.updateTicketStatus,
);

export default router;
