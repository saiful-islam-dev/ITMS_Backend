import { Router } from 'express';
import { FacilitiesController } from './facilities.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { getFacilitiesQuerySchema } from './facilities.dto';
import { authenticateJwt } from '../../middlewares/auth.middleware';

export function createFacilitiesRouter(): Router {
  const router = Router();
  const controller = new FacilitiesController();

  // All endpoints require valid JWT authentication
  router.use(authenticateJwt);

  router.get('/', validateRequest({ query: getFacilitiesQuerySchema }), controller.getFacilities);
  router.post('/ping-all', controller.pingAll);
  router.get('/:id/thermals', controller.getThermals);

  return router;
}
