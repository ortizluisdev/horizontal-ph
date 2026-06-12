import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { ContabilidadService } from "./contabilidad.service.js";
import {
  movimientoCreateSchema,
  movimientoUpdateSchema,
  movimientoAnularSchema,
  movimientoParamsSchema,
  movimientoQuerySchema,
} from "./contabilidad.schema.js";
import { z } from "zod";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new ContabilidadService();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleZodError(reply: FastifyReply, err: ZodError) {
  return reply.code(422).send({
    message: "Datos de entrada inválidos",
    errors: err.errors.map((e) => ({
      field:   e.path.join("."),
      message: e.message,
    })),
  });
}

function handleServiceError(reply: FastifyReply, err: unknown) {
  const e = err as any;
  const statusCode = e?.statusCode ?? 500;
  return reply.code(statusCode).send({ message: e?.message ?? "Error interno" });
}

// ─── Balance query schema (inline) ───────────────────────────────────────────

const balanceQuerySchema = z.object({
  conjuntoId: z.string().uuid("conjuntoId debe ser un UUID válido"),
  fechaDesde: z.string().date("Formato de fecha inválido, use YYYY-MM-DD"),
  fechaHasta: z.string().date("Formato de fecha inválido, use YYYY-MM-DD"),
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function listMovimientos(req: FastifyRequest, reply: FastifyReply) {
  const result = movimientoQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getMovimientoById(req: FastifyRequest, reply: FastifyReply) {
  const params = movimientoParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const item = await service.findById(params.data.id);
    if (!item) return reply.code(404).send({ message: "Movimiento no encontrado" });
    return reply.send(item);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createMovimiento(req: FastifyRequest, reply: FastifyReply) {
  const result = movimientoCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const created = await service.create(result.data);
    return reply.code(201).send(created);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updateMovimiento(req: FastifyRequest, reply: FastifyReply) {
  const params = movimientoParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = movimientoUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.update(params.data.id, body.data);
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function anularMovimiento(req: FastifyRequest, reply: FastifyReply) {
  const params = movimientoParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = movimientoAnularSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const anulado = await service.anular(params.data.id, body.data);
    return reply.send(anulado);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getBalance(req: FastifyRequest, reply: FastifyReply) {
  const result = balanceQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const balance = await service.getBalance(
      result.data.conjuntoId,
      result.data.fechaDesde,
      result.data.fechaHasta
    );
    return reply.send(balance);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}