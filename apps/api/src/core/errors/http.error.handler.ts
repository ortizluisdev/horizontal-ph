import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./app.error.js";

export function httpErrorHandler(
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: error.code,
      message: error.message,
    });
  }

  // Zod validation errors
  if (error.name === "ZodError") {
    return reply.code(400).send({
      error: "VALIDATION_ERROR",
      message: "Datos inválidos",
      details: (error as any).errors,
    });
  }

  // Fastify validation error
  if (error.statusCode === 400) {
    return reply.code(400).send({
      error: "BAD_REQUEST",
      message: error.message,
    });
  }

  console.error(error);
  return reply.code(500).send({
    error: "INTERNAL_ERROR",
    message: "Error interno del servidor",
  });
}