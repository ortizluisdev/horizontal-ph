import type { FastifyReply, FastifyRequest } from "fastify";
import { ContabilidadService } from "./contabilidad.service.js";
import { movimientoSchema } from "./contabilidad.schema.js";

const service = new ContabilidadService();

export async function listMovimientos(_: FastifyRequest, reply: FastifyReply) {
	const items = await service.list();
	return reply.send(items);
}

export async function getMovimientoById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const item = await service.findById(req.params.id);
	if (!item) return reply.code(404).send({ message: "Movimiento no encontrado" });
	return reply.send(item);
}

export async function createMovimiento(req: FastifyRequest, reply: FastifyReply) {
	const payload = movimientoSchema.parse(req.body);
	const created = await service.create(payload);
	return reply.code(201).send(created);
}
