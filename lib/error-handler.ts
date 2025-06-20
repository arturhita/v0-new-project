export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public isOperational = true,
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, false)
  }

  return new AppError("An unknown error occurred", 500, false)
}

export const logError = (error: AppError, context?: string) => {
  console.error(`[${context || "APP"}] ${error.name}: ${error.message}`, {
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    stack: error.stack,
  })
}
