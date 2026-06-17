import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { UnidadService } from "./unidades.service.js";
import {
  unidadCreateSchema,
  unidadUpdateSchema,
  unidadParamsSchema,
  unidadQuerySchema,
} from "./unidades.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new UnidadService();

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
  const code = e?.statusCode ?? 500;
  return reply.code(code).send({ message: e?.message ?? "Error interno del servidor" });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function listUnidades(req: FastifyRequest, reply: FastifyReply) {
  const result = unidadQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function listUnidadesByConjunto(req: FastifyRequest, reply: FastifyReply) {
  const params = unidadParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    return reply.send(await service.listByConjunto(params.data.id));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getUnidadById(req: FastifyRequest, reply: FastifyReply) {
  const params = unidadParamsSchema.safeParse(req.params);
  if (!params.success) return reply.code(400).send({ message: params.error.errors[0]?.message ?? "ID inválido" });

  try {
    const item = await service.findById(params.data.id);
    if (!item) return reply.code(404).send({ message: "Unidad no encontrada" });
    return reply.send(item);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createUnidad(req: FastifyRequest, reply: FastifyReply) {
  const result = unidadCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.code(201).send(await service.create(result.data));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updateUnidad(req: FastifyRequest, reply: FastifyReply) {
  const params = unidadParamsSchema.safeParse(req.params);
  if (!params.success) return reply.code(400).send({ message: params.error.errors[0]?.message ?? "ID inválido" });

  const body = unidadUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    return reply.send(await service.update(params.data.id, body.data));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deactivateUnidad(req: FastifyRequest, reply: FastifyReply) {
  const params = unidadParamsSchema.safeParse(req.params);
  if (!params.success) return reply.code(400).send({ message: params.error.errors[0]?.message ?? "ID inválido" });

  try {
    return reply.send(await service.deactivate(params.data.id));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deleteUnidad(req: FastifyRequest, reply: FastifyReply) {
  const params = unidadParamsSchema.safeParse(req.params);
  if (!params.success) return reply.code(400).send({ message: params.error.errors[0]?.message ?? "ID inválido" });

  try {
    await service.remove(params.data.id);
    return reply.code(204).send();
  } catch (err) {
    return handleServiceError(reply, err);
  }
}