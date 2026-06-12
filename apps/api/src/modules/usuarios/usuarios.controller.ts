import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { UsuarioService } from "./usuarios.service.js";
import {
  usuarioCreateSchema,
  usuarioUpdateSchema,
  usuarioQuerySchema,
  usuarioParamsSchema,
  usuarioBloqueoSchema,
} from "./usuarios.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new UsuarioService();

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

export async function getUsuarios(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const result = usuarioQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    return reply.send(await service.list(result.data, tenantId));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getUsuarioById(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = usuarioParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    const user = await service.findById(params.data.id, tenantId);
    if (!user) return reply.code(404).send({ message: "Usuario no encontrado" });
    return reply.send(user);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getUsuarioAuditLog(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = usuarioParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    return reply.send(await service.getAuditLog(params.data.id, tenantId));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function getUsuarioSessions(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = usuarioParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    return reply.send(await service.getSessions(params.data.id, tenantId));
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function createUsuario(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const result = usuarioCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);

  try {
    const created = await service.create(result.data, tenantId);
    return reply.code(201).send(created);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function updateUsuario(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = usuarioParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = usuarioUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.update(params.data.id, body.data, tenantId, getUserId(req));
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function setBloqueadoUsuario(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = usuarioParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  const body = usuarioBloqueoSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);

  try {
    const updated = await service.setBloqueado(params.data.id, tenantId, body.data, getUserId(req));
    return reply.send(updated);
  } catch (err) {
    return handleServiceError(reply, err);
  }
}

export async function deleteUsuario(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(400).send({ message: "Tenant no identificado" });

  const params = usuarioParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);

  try {
    await service.remove(params.data.id, tenantId, getUserId(req));
    return reply.code(204).send();
  } catch (err) {
    return handleServiceError(reply, err);
  }
}