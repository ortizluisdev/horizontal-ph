import type { FastifyReply, FastifyRequest } from "fastify";
import { unidadSchema } from "./unidades.schema.js";
import { UnidadService } from "./unidades.service.js";
import type { UnidadInput, Unidad } from "@horizontal-ph/types";

const service = new UnidadService();

type CreateUnidadRequest = FastifyRequest<{ Body: unknown }>;

export async function getUnidades(_: FastifyRequest, reply: FastifyReply) {
  const unidades: Unidad[] = await service.list();
  return reply.send(unidades);
}

export async function createUnidad(req: CreateUnidadRequest, reply: FastifyReply) {
  const unidad = unidadSchema.parse(req.body) as UnidadInput;
  const created = await service.create(unidad);
  return reply.code(201).send(created);
}
