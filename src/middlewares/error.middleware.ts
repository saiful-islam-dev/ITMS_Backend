import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response {
  const timestamp = new Date().toISOString();

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.name || 'ApplicationError',
      message: err.message,
      ...(err.validationErrors ? { validationErrors: err.validationErrors } : {}),
      meta: { timestamp },
    });
  }

  // Prisma Unique Constraint Error (P2002)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(', ')
        : (err.meta?.target as string) || 'unique field';
      return res.status(409).json({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: `A record with this ${target} already exists`,
        meta: { timestamp },
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: 'The requested record was not found in the database',
        meta: { timestamp },
      });
    }
  }

  // Default Internal Server Error
  console.error('💥 Unhandled Exception:', err);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    meta: { timestamp },
  });
}
