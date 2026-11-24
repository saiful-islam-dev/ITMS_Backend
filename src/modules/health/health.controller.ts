import { Request, Response, NextFunction } from 'express';
import { checkDatabaseConnection } from '../../database/prisma.client';
import { sendSuccessResponse } from '../../utils/response.util';

export class HealthController {
  public checkHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isDbConnected = await checkDatabaseConnection();
      const uptimeSeconds = process.uptime();
      const memoryUsage = process.memoryUsage();

      const healthData = {
        status: isDbConnected ? 'healthy' : 'degraded',
        services: {
          database: {
            status: isDbConnected ? 'connected' : 'disconnected',
            type: 'PostgreSQL 16+',
          },
          api: {
            status: 'operational',
            uptimeSeconds: Math.floor(uptimeSeconds),
            environment: process.env.NODE_ENV || 'development',
          },
        },
        system: {
          nodeVersion: process.version,
          memoryUsageMb: {
            rss: Math.round(memoryUsage.rss / (1024 * 1024)),
            heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
            heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
          },
        },
      };

      sendSuccessResponse({
        res,
        statusCode: isDbConnected ? 200 : 503,
        message: isDbConnected ? 'All systems operational' : 'Database connection degraded',
        data: healthData,
      });
    } catch (error) {
      next(error);
    }
  };
}
