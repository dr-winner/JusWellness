/**
 * Error handling utilities.
 *
 * OWASP A05: Security Misconfiguration — never expose internal errors to clients.
 * OWASP A09: Logging — log errors server-side with context.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Sanitize error for client response.
 * NEVER exposes internal error messages, stack traces, or DB errors.
 */
export function sanitizeError(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof AppError && error.isOperational) {
    // Operational errors have safe, user-facing messages
    return { message: error.message, status: error.statusCode };
  }

  if (error instanceof Error) {
    // Log full error server-side for debugging
    console.error("[Server Error]", {
      message: error.message,
      stack:
        process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  // Generic message — never leak internals
  return {
    message: "Something went wrong. Please try again.",
    status: 500,
  };
}

/**
 * Assert non-null with safe error.
 */
export function assertNonNull<T>(
  value: T | null | undefined,
  message = "Required value is missing"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AppError(message, 400);
  }
}

/**
 * Wrap an async handler with error boundary.
 */
export function withErrorBoundary<T>(
  handler: () => Promise<T>,
  fallbackMessage = "An error occurred"
): Promise<T> {
  return handler().catch((error) => {
    const { message, status } = sanitizeError(error);
    throw new AppError(
      status === 500 ? fallbackMessage : message,
      status
    );
  });
}
