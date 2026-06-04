// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@utils/errors';
import { RequestWithUser } from '@types/common';

/**
 * Extend Express Request with user
 */
declare global {
  namespace Express {
    interface Request extends RequestWithUser {
      user?: any;
    }
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    throw new UnauthorizedError('Please log in to access this resource');
  }
  next();
};

/**
 * Optional authentication - doesn't throw if not authenticated
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.userId = req.user?.id;
  }
  next();
};

/**
 * Admin role check
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    throw new UnauthorizedError('Please log in to access this resource');
  }

  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to access this resource');
  }

  next();
};