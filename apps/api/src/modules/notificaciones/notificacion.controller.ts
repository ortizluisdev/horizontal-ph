import type { FastifyReply, FastifyRequest } from "fastify";
import { NotificacionService } from "./notificacion.service.js";
import type { NotificacionInput, Notificacion } from "@horizontal-ph/types";

const service = new NotificacionService();

export async function listNotificaciones(_: FastifyRequest, reply: FastifyReply) {
	const items: Notificacion[] = await service.list();
	return reply.send(items);
}

export async function getNotificacionById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const item = await service.findById(req.params.id);
	if (!item) return reply.code(404).send({ message: "Notificación no encontrada" });
	return reply.send(item);
}

export async function createNotificacion(req: FastifyRequest, reply: FastifyReply) {
	const payload = req.body as NotificacionInput;
	const created = await service.create(payload);
	return reply.code(201).send(created);
}
