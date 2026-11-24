import { Router } from 'express';
import { TicketsController } from './tickets.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  getTicketsQuerySchema,
} from './tickets.dto';
import { authenticateJwt } from '../../middlewares/auth.middleware';

export function createTicketsRouter(): Router {
  const router = Router();
  const controller = new TicketsController();

  // All endpoints require valid JWT authentication
  router.use(authenticateJwt);

  router.get('/', validateRequest({ query: getTicketsQuerySchema }), controller.getTickets);
  router.post('/', validateRequest({ body: createTicketSchema }), controller.createTicket);
  router.patch('/:id/status', validateRequest({ body: updateTicketStatusSchema }), controller.updateStatus);

  return router;
}
