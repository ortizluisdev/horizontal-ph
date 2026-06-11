import type { FastifyReply, FastifyRequest } from "fastify";
import { CobranzaService } from "./cobranza.service.js";
import { cobranzaSchema } from "./cobranza.schema.js";
import type { CobranzaInput, Cobranza } from "@horizontal-ph/types";

const service = new CobranzaService();

export async function listCobranza(_: FastifyRequest, reply: FastifyReply) {
	const items: Cobranza[] = await service.list();
	return reply.send(items);
}

export async function getCobranzaById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const item = await service.findById(req.params.id);
	if (!item) return reply.code(404).send({ message: "Cobranza no encontrada" });
	return reply.send(item);
}

export async function createCobranza(req: FastifyRequest, reply: FastifyReply) {
	const payload = cobranzaSchema.parse(req.body) as CobranzaInput;
	const created = await service.create(payload);
	return reply.code(201).send(created);
}
