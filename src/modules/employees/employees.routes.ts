import { Router } from 'express';
import { EmployeesController } from './employees.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import {
  getEmployeesQuerySchema,
  createEmployeeSchema,
  updateEmployeeStatusSchema,
} from './employees.dto';
import { authenticateJwt } from '../../middlewares/auth.middleware';

export function createEmployeesRouter(): Router {
  const router = Router();
  const controller = new EmployeesController();

  // All endpoints require valid JWT authentication
  router.use(authenticateJwt);

  router.get('/', validateRequest({ query: getEmployeesQuerySchema }), controller.getEmployees);
  router.get('/metrics', controller.getMetrics);
  router.get('/export/csv', controller.exportCsv);
  router.post('/', validateRequest({ body: createEmployeeSchema }), controller.createEmployee);
  router.patch('/:id/status', validateRequest({ body: updateEmployeeStatusSchema }), controller.updateStatus);

  return router;
}
