import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import { authenticate, optionalAuth } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { validate } from '../middleware/validate.js';
import { createTicketSchema, ticketMessageSchema, updateTicketStatusSchema } from '../validators/ticket.schema.js';

const router = Router();

router.post('/', optionalAuth, validate(createTicketSchema), ticketController.createTicket);
router.get('/my', authenticate, ticketController.getUserTickets);
router.get('/:id', authenticate, ticketController.getTicket);
router.post('/:id/messages', authenticate, validate(ticketMessageSchema), ticketController.addMessage);
router.get('/', authenticate, requirePermission('tickets'), ticketController.getAllTickets);
router.put('/:id/status', authenticate, requirePermission('tickets'), validate(updateTicketStatusSchema), ticketController.updateTicketStatus);

export default router;
