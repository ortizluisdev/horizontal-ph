import type { FastifyReply, FastifyRequest } from "fastify";
import { AsambleaService } from "./asamblea.service.js";
import { asambleaSchema } from "./asamblea.schema.js";
import type { AsambleaInput, Asamblea } from "@horizontal-ph/types";

const service = new AsambleaService();

export async function listAsambleas(_: FastifyRequest, reply: FastifyReply) {
	const items: Asamblea[] = await service.list();
	return reply.send(items);
}

export async function getAsambleaById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const item = await service.findById(req.params.id);
	if (!item) return reply.code(404).send({ message: "Asamblea no encontrada" });
	return reply.send(item);
}

export async function createAsamblea(req: FastifyRequest, reply: FastifyReply) {
	const payload = asambleaSchema.parse(req.body) as AsambleaInput;
	const created = await service.create(payload);
	return reply.code(201).send(created);
}
