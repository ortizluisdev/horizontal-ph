import type { FastifyReply, FastifyRequest } from "fastify";
import { NormativaService } from "./normativa.service.js";
import type { NormativaInput, Normativa } from "@horizontal-ph/types";

const service = new NormativaService();

export async function listNormativas(_: FastifyRequest, reply: FastifyReply) {
	const items: Normativa[] = await service.list();
	return reply.send(items);
}

export async function getNormativaById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const item = await service.findById(req.params.id);
	if (!item) return reply.code(404).send({ message: "Normativa no encontrada" });
	return reply.send(item);
}

export async function createNormativa(req: FastifyRequest, reply: FastifyReply) {
	const payload = req.body as NormativaInput;
	const created = await service.create(payload);
	return reply.code(201).send(created);
}
