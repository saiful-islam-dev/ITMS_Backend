import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config';
import { errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './errors/app.error';
import { swaggerSpec } from './config/swagger.config';
import { createHealthRouter } from './modules/health/health.routes';
import { createAuthRouter } from './modules/auth/auth.routes';

export function createApp(): Application {
  const app: Application = express();

  // 1. Security Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 2. Request Parsing Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // 4. Swagger API Documentation (mounted at /api/docs)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Apex Garments ITMS API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // 5. Global API Prefix Router
  const apiRouter = express.Router();
  apiRouter.use('/health', createHealthRouter());
  apiRouter.use('/auth', createAuthRouter());

  app.use(env.API_PREFIX, apiRouter);

  // Root redirect to docs or health
  app.get('/', (_req: Request, res: Response) => {
    res.redirect('/api/docs');
  });

  // 6. 404 Route Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found on server`));
  });

  // 7. Global Exception Filter / Error Handler Middleware
  app.use(errorHandler);

  return app;
}
