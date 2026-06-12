// ─── AppError ─────────────────────────────────────────────────────────────────
// Error tipado con statusCode y code string para respuestas HTTP consistentes.

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code:       string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name       = "AppError";
    this.statusCode = statusCode;
    this.code       = code;
    // Mantiene el stack trace correcto en V8
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }

  // ── Factories ──────────────────────────────────────────────────────────────

  static notFound(resource: string) {
    return new AppError(`${resource} no encontrado`, 404, "NOT_FOUND");
  }

  static unauthorized(message = "No autorizado") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Acceso denegado") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static badRequest(message: string) {
    return new AppError(message, 400, "BAD_REQUEST");
  }

  static conflict(message: string) {
    return new AppError(message, 409, "CONFLICT");
  }

  static unprocessable(message: string) {
    return new AppError(message, 422, "UNPROCESSABLE_ENTITY");
  }

  static internal(message = "Error interno del servidor") {
    return new AppError(message, 500, "INTERNAL_ERROR");
  }
}