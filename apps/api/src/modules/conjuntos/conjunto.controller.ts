import type { FastifyReply, FastifyRequest } from "fastify";
import { ConjuntoService } from "./conjunto.service.js";
import { conjuntoSchema } from "./conjunto.schema.js";
import type { ConjuntoInput, Conjunto } from "@horizontal-ph/types";

const service = new ConjuntoService();

export async function listConjuntos(_: FastifyRequest, reply: FastifyReply) {
	const items: Conjunto[] = await service.list();
	return reply.send(items);
}

export async function getConjuntoById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const item = await service.findById(req.params.id);
	if (!item) return reply.code(404).send({ message: "Conjunto no encontrado" });
	return reply.send(item);
}

export async function createConjunto(req: FastifyRequest, reply: FastifyReply) {
	const payload = conjuntoSchema.parse(req.body) as ConjuntoInput;
	const created = await service.create(payload);
	return reply.code(201).send(created);
}
