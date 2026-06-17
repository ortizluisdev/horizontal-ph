import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AsambleaService } from './asamblea.service.js'
import {
  asambleaCreateSchema,
  asambleaUpdateSchema,
  asambleaParamsSchema,
  asambleaQuerySchema,
  votacionCreateSchema,
  votacionUpdateSchema,
  votacionParamsSchema,
  acuerdoCreateSchema,
  acuerdoUpdateSchema,
  acuerdoParamsSchema,
} from './asamblea.schema.js'

const service = new AsambleaService()

function handleZodError(reply: FastifyReply, err: ZodError) {
  return reply.code(422).send({
    message: 'Datos de entrada inválidos',
    errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
  })
}

function handleServiceError(reply: FastifyReply, err: unknown) {
  const e = err as any
  return reply.code(e?.statusCode ?? 500).send({ message: e?.message ?? 'Error interno' })
}

function getTenantId(req: FastifyRequest): string {
  const user = (req as any).user
  return user?.tenant_id ?? ''
}

function getUserId(req: FastifyRequest): string {
  const user = (req as any).user
  return user?.id ?? ''
}

// ─── Asambleas ────────────────────────────────────────────────────────────────

export async function listAsambleas(req: FastifyRequest, reply: FastifyReply) {
  const result = asambleaQuerySchema.safeParse(req.query)
  if (!result.success) return handleZodError(reply, result.error)
  try {
    return reply.send(await service.list(result.data, getTenantId(req)))
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function getAsambleaById(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  try {
    const item = await service.findById(params.data.id, getTenantId(req))
    if (!item) return reply.code(404).send({ message: 'Asamblea no encontrada' })
    return reply.send(item)
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function createAsamblea(req: FastifyRequest, reply: FastifyReply) {
  const result = asambleaCreateSchema.safeParse(req.body)
  if (!result.success) return handleZodError(reply, result.error)
  try {
    const created = await service.create(result.data, getTenantId(req), getUserId(req))
    return reply.code(201).send(created)
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function updateAsamblea(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  const body = asambleaUpdateSchema.safeParse(req.body)
  if (!body.success) return handleZodError(reply, body.error)
  try {
    const updated = await service.update(params.data.id, body.data, getTenantId(req), getUserId(req))
    return reply.send(updated)
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function deactivateAsamblea(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  try {
    await service.deactivate(params.data.id, getTenantId(req), getUserId(req))
    return reply.code(204).send()
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function deleteAsamblea(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  try {
    await service.remove(params.data.id, getTenantId(req))
    return reply.code(204).send()
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

// ─── Votaciones ───────────────────────────────────────────────────────────────

export async function listVotaciones(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  try {
    return reply.send(await service.listVotaciones(params.data.id, getTenantId(req)))
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function createVotacion(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  const body = votacionCreateSchema.safeParse(req.body)
  if (!body.success) return handleZodError(reply, body.error)
  try {
    const created = await service.createVotacion(params.data.id, body.data, getTenantId(req))
    return reply.code(201).send(created)
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function updateVotacion(req: FastifyRequest, reply: FastifyReply) {
  const params = votacionParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  const body = votacionUpdateSchema.safeParse(req.body)
  if (!body.success) return handleZodError(reply, body.error)
  try {
    const updated = await service.updateVotacion(params.data.id, params.data.vid, body.data, getTenantId(req))
    return reply.send(updated)
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function deleteVotacion(req: FastifyRequest, reply: FastifyReply) {
  const params = votacionParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  try {
    await service.deleteVotacion(params.data.id, params.data.vid, getTenantId(req))
    return reply.code(204).send()
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

// ─── Acuerdos ─────────────────────────────────────────────────────────────────

export async function listAcuerdos(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  try {
    return reply.send(await service.listAcuerdos(params.data.id, getTenantId(req)))
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function createAcuerdo(req: FastifyRequest, reply: FastifyReply) {
  const params = asambleaParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  const body = acuerdoCreateSchema.safeParse(req.body)
  if (!body.success) return handleZodError(reply, body.error)
  try {
    const created = await service.createAcuerdo(params.data.id, body.data, getTenantId(req))
    return reply.code(201).send(created)
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function updateAcuerdo(req: FastifyRequest, reply: FastifyReply) {
  const params = acuerdoParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  const body = acuerdoUpdateSchema.safeParse(req.body)
  if (!body.success) return handleZodError(reply, body.error)
  try {
    const updated = await service.updateAcuerdo(params.data.id, params.data.aid, body.data, getTenantId(req))
    return reply.send(updated)
  } catch (err) {
    return handleServiceError(reply, err)
  }
}

export async function deleteAcuerdo(req: FastifyRequest, reply: FastifyReply) {
  const params = acuerdoParamsSchema.safeParse(req.params)
  if (!params.success) return handleZodError(reply, params.error)
  try {
    await service.deleteAcuerdo(params.data.id, params.data.aid, getTenantId(req))
    return reply.code(204).send()
  } catch (err) {
    return handleServiceError(reply, err)
  }
}
