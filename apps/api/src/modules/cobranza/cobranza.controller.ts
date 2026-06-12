import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { CobranzaService } from "./cobranza.service.js";
import {
  cobranzaCreateSchema,
  cobranzaUpdateSchema,
  cobranzaParamsSchema,
  cobranzaQuerySchema,
} from "./cobranza.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new CobranzaService();

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

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function listCobranzas(req: FastifyRequest, reply: FastifyReply) {
  const result = cobranzaQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getCobranzaById(req: FastifyRequest, reply: FastifyReply) {
  const params = cobranzaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const item = await service.findById(params.data.id);
    if (!item) return reply.code(404).send({ message: "Cobranza no encontrada" });
    return reply.send(item);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createCobranza(req: FastifyRequest, reply: FastifyReply) {
  const result = cobranzaCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const created = await service.create(result.data);
    return reply.code(201).send(created);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updateCobranza(req: FastifyRequest, reply: FastifyReply) {
  const params = cobranzaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = cobranzaUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.update(params.data.id, body.data);
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deleteCobranza(req: FastifyRequest, reply: FastifyReply) {
  const params = cobranzaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    await service.remove(params.data.id);
    return reply.code(204).send();
  } catch (err) {
    return handleServiceError(reply, err);
  }
}