export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound(r: string) { return new AppError(`${r} no encontrado`, 404, "NOT_FOUND"); }
  static unauthorized(m = "No autorizado") { return new AppError(m, 401, "UNAUTHORIZED"); }
  static forbidden(m = "Acceso denegado") { return new AppError(m, 403, "FORBIDDEN"); }
  static badRequest(m: string) { return new AppError(m, 400, "BAD_REQUEST"); }
}