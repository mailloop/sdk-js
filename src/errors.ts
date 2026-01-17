import type { ApiError } from "./types.js";

/**
 * Base error class for all Mailloop SDK errors
 */
export class MailloopError extends Error {
  readonly code: string;
  readonly status: number | undefined;
  readonly details: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    status?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MailloopError";
    this.code = code;
    this.status = status;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if ("captureStackTrace" in Error) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  static fromApiError(apiError: ApiError, status?: number): MailloopError {
    const { code, message, details } = apiError;

    switch (code) {
      case "UNAUTHORIZED":
        return new AuthenticationError(message, details);
      case "FORBIDDEN":
        return new PermissionError(message, details);
      case "NOT_FOUND":
        return new NotFoundError(message, details);
      case "RATE_LIMIT_EXCEEDED":
        return new RateLimitError(message, 0, details);
      case "VALIDATION_ERROR":
        return new ValidationError(message, details);
      default:
        return new MailloopError(message, code, status, details);
    }
  }
}

/**
 * Thrown when authentication fails (invalid or missing API token)
 */
export class AuthenticationError extends MailloopError {
  constructor(message = "Invalid or missing API token", details?: Record<string, unknown>) {
    super(message, "UNAUTHORIZED", 401, details);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when the API token lacks required permissions
 */
export class PermissionError extends MailloopError {
  constructor(message = "Insufficient permissions", details?: Record<string, unknown>) {
    super(message, "FORBIDDEN", 403, details);
    this.name = "PermissionError";
  }
}

/**
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends MailloopError {
  constructor(message = "Resource not found", details?: Record<string, unknown>) {
    super(message, "NOT_FOUND", 404, details);
    this.name = "NotFoundError";
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends MailloopError {
  /** Seconds until rate limit resets */
  readonly retryAfter: number;

  constructor(
    message = "Rate limit exceeded",
    retryAfter = 0,
    details?: Record<string, unknown>
  ) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, details);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when waiting for an email times out
 */
export class TimeoutError extends MailloopError {
  constructor(message = "Operation timed out", details?: Record<string, unknown>) {
    super(message, "TIMEOUT", undefined, details);
    this.name = "TimeoutError";
  }
}

/**
 * Thrown when request validation fails
 */
export class ValidationError extends MailloopError {
  constructor(message = "Validation failed", details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}
