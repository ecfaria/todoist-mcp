/**
 * Custom error classes for Todoist API interactions
 */

/**
 * Base error class for Todoist API errors
 */
export class TodoistApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = 'TodoistApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Rate limit error (HTTP 429)
 */
export class RateLimitError extends TodoistApiError {
  constructor(message: string = 'Rate limit exceeded. Please try again later.') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

/**
 * Validation error for input parameters
 */
export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
    Error.captureStackTrace(this, this.constructor);
  }
}
