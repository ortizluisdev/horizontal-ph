import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app.error.js";
import logger from "../logger/logger.js";

// ─── Handler global de errores para Fastify ───────────────────────────────────

export function httpErrorHandler(
  error: FastifyError | AppError | ZodError | Error,
  req:   FastifyRequest,
  reply: FastifyReply
) {
  // ── AppError tipado ───────────────────────────────────────────────────────
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error:   error.code,
      message: error.message,
    });
  }

  // ── Error con statusCode ad-hoc (Object.assign pattern usado en módulos) ──
  const anyErr = error as any;
  if (anyErr?.statusCode && typeof anyErr.statusCode === "number") {
    return reply.code(anyErr.statusCode).send({
      error:   statusCodeToCode(anyErr.statusCode),
      message: anyErr.message ?? "Error",
    });
  }

  // ── ZodError (validación de esquema) ─────────────────────────────────────
  if (error instanceof ZodError) {
    return reply.code(422).send({
      error:   "VALIDATION_ERROR",
      message: "Datos de entrada inválidos",
      errors:  error.errors.map((e) => ({
        field:   e.path.join("."),
        message: e.message,
      })),
    });
  }

  // ── PostgreSQL errors ─────────────────────────────────────────────────────
  if (anyErr?.code === "23505") {
    return reply.code(409).send({
      error:   "CONFLICT",
      message: "Ya existe un registro con esos datos únicos",
    });
  }

  if (anyErr?.code === "23503") {
    return reply.code(400).send({
      error:   "FOREIGN_KEY_VIOLATION",
      message: "Referencia a un registro que no existe",
    });
  }

  if (anyErr?.code === "23502") {
    return reply.code(400).send({
      error:   "NOT_NULL_VIOLATION",
      message: "Falta un campo obligatorio: " + (anyErr?.column ?? ""),
    });
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (anyErr?.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER" ||
      anyErr?.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED" ||
      anyErr?.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
    return reply.code(401).send({
      error:   "UNAUTHORIZED",
      message: "Token inválido o expirado",
    });
  }

  // ── Fastify validation (schema JSON) ─────────────────────────────────────
  if (anyErr?.statusCode === 400 && anyErr?.validation) {
    return reply.code(400).send({
      error:   "BAD_REQUEST",
      message: error.message,
    });
  }

  // ── Error inesperado ─────────────────────────────────────────────────────
  logger.error(
    { err: error, method: req.method, url: req.url },
    "Unhandled error"
  );

  return reply.code(500).send({
    error:   "INTERNAL_ERROR",
    message: "Error interno del servidor",
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function statusCodeToCode(status: number): string {
  const map: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    500: "INTERNAL_ERROR",
  };
  return map[status] ?? "ERROR";
}