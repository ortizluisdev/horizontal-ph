import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { NotificacionService } from "./notificacion.service.js";
import {
  notificacionCreateSchema,
  notificacionUpdateSchema,
  notificacionParamsSchema,
  notificacionQuerySchema,
} from "./notificacion.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new NotificacionService();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTenantId(req: FastifyRequest): string | null {
  return (req as any).user?.tenant_id ?? null;
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

export async function listNotificaciones(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const result = notificacionQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data, tenantId));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getNotificacionById(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = notificacionParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const item = await service.findById(params.data.id, tenantId);
    if (!item) return reply.code(404).send({ message: "Notificación no encontrada" });
    return reply.send(item);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createNotificacion(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const result = notificacionCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const created = await service.create(result.data, tenantId);
    return reply.code(201).send(created);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updateNotificacion(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = notificacionParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = notificacionUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.update(params.data.id, body.data, tenantId);
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deleteNotificacion(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = notificacionParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    await service.remove(params.data.id, tenantId);
    return reply.code(204).send();
  } catch (err) {
    return handleServiceError(reply, err);
  }
}