import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.dto';
import { authenticateJwt } from '../../middlewares/auth.middleware';

export function createAuthRouter(): Router {
  const router = Router();
  const controller = new AuthController();

  router.post('/register', validateRequest({ body: registerSchema }), controller.register);
  router.post('/login', validateRequest({ body: loginSchema }), controller.login);
  router.post('/refresh', validateRequest({ body: refreshTokenSchema }), controller.refresh);
  router.get('/me', authenticateJwt, controller.getMe);

  return router;
}
