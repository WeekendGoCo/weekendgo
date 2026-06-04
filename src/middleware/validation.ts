// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '@utils/errors';

/**
 * Hotel Search Validation Schema
 */
export const HotelSearchSchema = z.object({
  destination: z.string().optional(),
  destId: z.string().optional(),
  checkIn: z.string().date().optional(),
  checkOut: z.string().date().optional(),
  guests: z.number().min(1).max(10).default(2),
  children: z.array(z.number()).default([]),
}).refine(
  (data) => !data.checkIn || !data.checkOut || new Date(data.checkIn) < new Date(data.checkOut),
  { message: 'checkIn must be before checkOut' }
);

export type HotelSearchInput = z.infer<typeof HotelSearchSchema>;

/**
 * Location Search Validation Schema
 */
export const LocationSearchSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  q: z.string().optional(),
}).transform((data) => ({
  query: data.query || data.q || '',
}));

export type LocationSearchInput = z.infer<typeof LocationSearchSchema>;

/**
 * Validate Hotel Search Request
 */
export const validateHotelSearch = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = HotelSearchSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      
      throw new ValidationError('Invalid hotel search parameters', details);
    }
    throw error;
  }
};

/**
 * Validate Location Search Request
 */
export const validateLocationSearch = (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query || req.query.q;
    const validated = LocationSearchSchema.parse({ query: String(query || '') });
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      
      throw new ValidationError('Invalid location search parameters', details);
    }
    throw error;
  }
};

/**
 * Generic validation middleware factory
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);
        
        throw new ValidationError('Validation failed', details);
      }
      throw error;
    }
  };
}