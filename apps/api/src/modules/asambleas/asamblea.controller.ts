import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AsambleaService } from "./asamblea.service.js";
import {
  asambleaCreateSchema,
  asambleaUpdateSchema,
  asambleaParamsSchema,
  asambleaQuerySchema,
} from "./asamblea.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new AsambleaService();

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

export async function listAsambleas(req: FastifyRequest, reply: FastifyReply) {
  const result = asambleaQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getAsambleaById(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const item = await service.findById(params.data.id);
    if (!item) return reply.code(404).send({ message: "Asamblea no encontrada" });
    return reply.send(item);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createAsamblea(req: FastifyRequest, reply: FastifyReply) {
  const result = asambleaCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const created = await service.create(result.data);
    return reply.code(201).send(created);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updateAsamblea(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = asambleaUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.update(params.data.id, body.data);
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deleteAsamblea(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    await service.remove(params.data.id);
    return reply.code(204).send();
  } catch (err) {
    return handleServiceError(reply, err);
  }
}