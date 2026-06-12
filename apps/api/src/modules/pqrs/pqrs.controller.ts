import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { PqrsService } from "./pqrs.service.js";
import {
  pqrsCreateSchema,
  pqrsUpdateSchema,
  pqrsParamsSchema,
  pqrsQuerySchema,
} from "./pqrs.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new PqrsService();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTenantId(req: FastifyRequest): string | null {
  return (req as any).user?.tenant_id ?? null;
}

function getUserId(req: FastifyRequest): string | undefined {
  return (req as any).user?.sub ?? undefined;
}

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

export async function listPqrs(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const result = pqrsQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data, tenantId));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getPqrsById(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = pqrsParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const item = await service.findById(params.data.id, tenantId);
    if (!item) return reply.code(404).send({ message: "PQRS no encontrada" });
    return reply.send(item);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getPqrsSeguimiento(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = pqrsParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const seguimiento = await service.getSeguimiento(params.data.id, tenantId);
    return reply.send(seguimiento);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createPqrs(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const result = pqrsCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const created = await service.create(result.data, tenantId);
    return reply.code(201).send(created);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updatePqrs(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = pqrsParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = pqrsUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.update(params.data.id, body.data, tenantId, getUserId(req));
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deletePqrs(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = pqrsParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    await service.remove(params.data.id, tenantId);
    return reply.code(204).send();
  } catch (err) {
    return handleServiceError(reply, err);
  }
}