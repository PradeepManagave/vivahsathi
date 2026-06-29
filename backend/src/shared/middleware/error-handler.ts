// ============================================================
// Error Handler Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../../config/logger';
import { AppError, ValidationError, FieldError } from '../utils/errors';

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      errors?: FieldError[];
      stack?: string;
      [key: string]: unknown;
    };
  };
  timestamp: string;
}

// Development error response
function developmentError(error: Error & { code?: string }): ErrorResponse {
  return {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message,
      details: {
        stack: error.stack
      }
    },
    timestamp: new Date().toISOString()
  };
}

// Production error response
function productionError(error: AppError): ErrorResponse {
  // Don't expose internal error details in production
  return {
    success: false,
    error: {
      code: error.code,
      message: error.isOperational ? error.message : 'Something went wrong',
      ...(error.details && { details: error.details })
    },
    timestamp: new Date().toISOString()
  };
}

// Global error handler
export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      },
      timestamp: new Date().toISOString()
    } as ErrorResponse);
    return;
  }

  // Handle ValidationError (Zod)
  if (err instanceof ZodError) {
    const fieldErrors: FieldError[] = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { errors: fieldErrors }
      },
      timestamp: new Date().toISOString()
    } as ErrorResponse);
    return;
  }

  // Handle Database errors (Knex/pg)
  if (err instanceof Error && 'code' in err) {
    const dbError = err as Error & { code?: string; detail?: string };
    
    if (dbError.code === '23505') {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this value already exists'
        },
        timestamp: new Date().toISOString()
      } as ErrorResponse);
      return;
    }

    if (dbError.code === '23503') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REFERENCE',
          message: 'Referenced record does not exist'
        },
        timestamp: new Date().toISOString()
      } as ErrorResponse);
      return;
    }
  }

  // Handle syntax errors (invalid JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body'
      },
      timestamp: new Date().toISOString()
    } as ErrorResponse);
    return;
  }

  // Unknown error - don't leak details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'Something went wrong' : err.message,
      ...(!isProduction && { details: { stack: err.stack } })
    },
    timestamp: new Date().toISOString()
  } as ErrorResponse);
}

// Async handler wrapper to catch async errors
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
