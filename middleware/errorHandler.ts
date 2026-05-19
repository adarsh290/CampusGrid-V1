import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

/**
 * Centralised Express error-handling middleware.
 *
 * Operational errors (AppError instances) return a clean JSON response.
 * Unexpected programmer errors log the full stack server-side and return
 * a generic 500 so no internal details leak to the client.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Always log the error server-side
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err.stack);

  if (err instanceof AppError) {
    // Known operational error — safe to expose message to the client
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field';
    res.status(409).json({
      status: 'error',
      message: `A record with that ${field} already exists.`,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ status: 'error', message: 'Invalid token.' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ status: 'error', message: 'Token has expired.' });
    return;
  }

  // Unknown / programmer error — never expose internals
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};
