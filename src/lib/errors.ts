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

export function sanitizeError(error: unknown): { message: string; status: number } {
  if (error instanceof AppError) {
    return { message: error.message, status: error.statusCode };
  }

  if (error instanceof Error) {
    // Never expose internal error messages to client
    const isDev = process.env.NODE_ENV === "development";
    console.error("[Server Error]", error.message);
    return {
      message: isDev ? error.message : "Something went wrong. Please try again.",
      status: 500,
    };
  }

  return { message: "An unexpected error occurred.", status: 500 };
}

export function assertNonNull<T>(
  value: T | null | undefined,
  message = "Required value is missing"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AppError(message, 400);
  }
}
