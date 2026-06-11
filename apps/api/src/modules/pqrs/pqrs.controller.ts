import type { FastifyReply, FastifyRequest } from "fastify";
import { PqrsService } from "./pqrs.service.js";
import { pqrsSchema } from "./pqrs.schema.js";
import type { PqrsInput, Pqrs } from "@horizontal-ph/types";

const service = new PqrsService();

export async function listPqrs(_: FastifyRequest, reply: FastifyReply) {
	const items: Pqrs[] = await service.list();
	return reply.send(items);
}

export async function getPqrsById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const item = await service.findById(req.params.id);
	if (!item) return reply.code(404).send({ message: "PQRS no encontrada" });
	return reply.send(item);
}

export async function createPqrs(req: FastifyRequest, reply: FastifyReply) {
	const payload = pqrsSchema.parse(req.body) as PqrsInput;
	const created = await service.create(payload);
	return reply.code(201).send(created);
}
