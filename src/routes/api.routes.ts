import { Router } from 'express';
import { createHealthRouter } from '../modules/health/health.routes';
import { createAuthRouter } from '../modules/auth/auth.routes';
import { createEmployeesRouter } from '../modules/employees/employees.routes';
import { createAssetsRouter } from '../modules/assets/assets.routes';
import { createTicketsRouter } from '../modules/tickets/tickets.routes';
import { createFacilitiesRouter } from '../modules/facilities/facilities.routes';

/**
 * Master Enterprise API Router for Apex Garments ITMS
 * Aggregates all domain module sub-routers mounted under base prefix /api/v1
 */
export function createApiRouter(): Router {
  const apiRouter = Router();

  // 1. Health & Readiness Telemetry
  apiRouter.use('/health', createHealthRouter());

  // 2. Authentication & Session Management (/api/v1/auth)
  apiRouter.use('/auth', createAuthRouter());

  // 3. Employee Directory & HRMIS Integration (/api/v1/employees)
  apiRouter.use('/employees', createEmployeesRouter());

  // 4. IT Assets & Hardware Lifecycle (/api/v1/assets)
  apiRouter.use('/assets', createAssetsRouter());

  // 5. Support Tickets & Issue Tracker (/api/v1/tickets)
  apiRouter.use('/tickets', createTicketsRouter());

  // 6. Facilities & Network Infrastructure Telemetry (/api/v1/facilities)
  apiRouter.use('/facilities', createFacilitiesRouter());

  return apiRouter;
}
