import { Response } from 'express';

export interface ApiResponseMeta {
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export function sendSuccessResponse<T>({
  res,
  statusCode = 200,
  message = 'Operation completed successfully',
  data,
  meta = {},
}: ApiResponseOptions<T>): Response {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data: data !== undefined ? data : null,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function sendPaginatedResponse<T>({
  res,
  statusCode = 200,
  message = 'Data retrieved successfully',
  data,
  page,
  limit,
  totalItems,
  meta = {},
}: ApiResponseOptions<T[]> & {
  page: number;
  limit: number;
  totalItems: number;
}): Response {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data: data || [],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}
