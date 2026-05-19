/**
 * Custom operational error class.
 * Distinguishes between programmer errors and expected runtime errors
 * so the error handler can respond appropriately.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  /** True for expected, user-facing errors. False for unexpected bugs. */
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintain proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
