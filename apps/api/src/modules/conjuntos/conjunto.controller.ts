import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ConjuntoService } from './conjunto.service.js';
import {
  conjuntoCreateSchema,
  conjuntoUpdateSchema,
  conjuntoParamsSchema,
  conjuntoQuerySchema,
} from './conjunto.schema.js';

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new ConjuntoService();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleZodError(reply: FastifyReply, err: ZodError) {
  return reply.code(422).send({
    message: 'Datos de entrada inválidos',
    errors: err.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message,
    })),
  });
}

function handleServiceError(reply: FastifyReply, err: unknown) {
  const e = err as { statusCode?: number; message?: string };
  const statusCode = e?.statusCode ?? 500;
  return reply
    .code(statusCode)
    .send({ message: e?.message ?? 'Error interno del servidor' });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function listConjuntos(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const result = conjuntoQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getConjuntoById(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const params = conjuntoParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const item = await service.findById(params.data.id);
    if (!item) return reply.code(404).send({ message: 'Conjunto no encontrado' });
    return reply.send(item);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createConjunto(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const result = conjuntoCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const created = await service.create(result.data);
    return reply.code(201).send(created);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updateConjunto(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const params = conjuntoParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = conjuntoUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.update(params.data.id, body.data);
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deactivateConjunto(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const params = conjuntoParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const result = await service.deactivate(params.data.id);
    return reply.send(result);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deleteConjunto(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const params = conjuntoParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    await service.remove(params.data.id);
    return reply.code(204).send();
  } catch (err) {
    return handleServiceError(reply, err);
  }
}