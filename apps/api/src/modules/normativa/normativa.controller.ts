import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { NormativaService } from "./normativa.service.js";
import {
  normativaCreateSchema,
  normativaUpdateSchema,
  normativaParamsSchema,
  normativaQuerySchema,
} from "./normativa.schema.js";

// ─── Singleton ────────────────────────────────────────────────────────────────

const service = new NormativaService();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTenantId(req: FastifyRequest): string | null {
  return (req as any).user?.tenant_id ?? null;
}

function handleZodError(reply: FastifyReply, err: ZodError) {
  return reply.code(422).send({
    message: "Datos de entrada inválidos",
    errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
  });
}

function handleServiceError(reply: FastifyReply, err: unknown) {
  const e = err as any;
  return reply.code(e?.statusCode ?? 500).send({ message: e?.message ?? "Error interno" });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function listNormativas(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(401).send({ message: "No autenticado" });
  const result = normativaQuerySchema.safeParse(req.query);
  if (!result.success) return handleZodError(reply, result.error);
  try { return reply.send(await service.list(result.data, tenantId)); }
  catch (err) { return handleServiceError(reply, err); }
}

export async function getNormativaById(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(401).send({ message: "No autenticado" });
  const params = normativaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);
  try {
    const item = await service.findById(params.data.id, tenantId);
    if (!item) return reply.code(404).send({ message: "Normativa no encontrada" });
    return reply.send(item);
  } catch (err) { return handleServiceError(reply, err); }
}

export async function createNormativa(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(401).send({ message: "No autenticado" });
  const result = normativaCreateSchema.safeParse(req.body);
  if (!result.success) return handleZodError(reply, result.error);
  try { return reply.code(201).send(await service.create(result.data, tenantId)); }
  catch (err) { return handleServiceError(reply, err); }
}

export async function updateNormativa(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(401).send({ message: "No autenticado" });
  const params = normativaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);
  const body = normativaUpdateSchema.safeParse(req.body);
  if (!body.success) return handleZodError(reply, body.error);
  try { return reply.send(await service.update(params.data.id, body.data, tenantId)); }
  catch (err) { return handleServiceError(reply, err); }
}

export async function deactivateNormativa(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(401).send({ message: "No autenticado" });
  const params = normativaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);
  try {
    await service.deactivate(params.data.id, tenantId);
    return reply.code(204).send();
  } catch (err) { return handleServiceError(reply, err); }
}

export async function deleteNormativa(req: FastifyRequest, reply: FastifyReply) {
  const tenantId = getTenantId(req);
  if (!tenantId) return reply.code(401).send({ message: "No autenticado" });
  const params = normativaParamsSchema.safeParse(req.params);
  if (!params.success) return handleZodError(reply, params.error);
  try {
    await service.remove(params.data.id, tenantId);
    return reply.code(204).send();
  } catch (err) { return handleServiceError(reply, err); }
}
