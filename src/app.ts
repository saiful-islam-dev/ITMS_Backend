import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config';
import { errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './errors/app.error';
import { swaggerSpec } from './config/swagger.config';
import { createApiRouter } from './routes/api.routes';

export function createApp(): Application {
  const app: Application = express();

  // 1. Security Middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
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

  // 3. Static Assets (Uploads directory for Challans / Invoices)
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // 4. HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // 5. Swagger API Documentation (mounted at /api/docs)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Apex Garments ITMS API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // 6. Global API Prefix Router (/api/v1)
  app.use(env.API_PREFIX, createApiRouter());

  // Root redirect to docs
  app.get('/', (_req: Request, res: Response) => {
    res.redirect('/api/docs');
  });

  // 7. 404 Route Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found on server`));
  });

  // 8. Global Exception Filter / Error Handler Middleware
  app.use(errorHandler);

  return app;
}
