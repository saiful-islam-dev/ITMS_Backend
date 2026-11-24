export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly validationErrors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode = 500,
    validationErrors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.validationErrors = validationErrors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', validationErrors?: Array<{ field: string; message: string }>) {
    super(message, 400, validationErrors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden resource') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}
