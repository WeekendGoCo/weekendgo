// src/middleware/errorHandler.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError, sendErrorResponse } from '@utils/errors';
import logger from '@utils/logger';

/**
 * Global Error Handler Middleware
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `req_${Date.now()}`;

  // Log the error
  if (error instanceof AppError) {
    logger.warn(`[${requestId}] ${error.code}: ${error.message}`, {
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error(`[${requestId}] Unhandled error: ${error.message}`, error, {
      path: req.path,
      method: req.method,
      body: req.body,
    });
  }

  // Send error response
  return sendErrorResponse(res, error, requestId);
};

/**
 * 404 Handler Middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.path}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Request ID Middleware
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || `req_${Date.now()}`;
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

/**
 * Request Logging Middleware
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    if (statusCode >= 400) {
      logger.warn(`[${requestId}] ${req.method} ${req.path} - ${statusCode}`, {
        duration,
        method: req.method,
        path: req.path,
        query: req.query,
      });
    } else {
      logger.info(`[${requestId}] ${req.method} ${req.path} - ${statusCode}`, {
        duration,
        method: req.method,
        path: req.path,
      });
    }
  });

  next();
};