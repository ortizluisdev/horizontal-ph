import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../../modules/auth/auth.service.js";

const service = new AuthService();

export default async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
	try {
		await req.jwtVerify();
	} catch (err) {
		return reply.code(401).send({ message: "Token inválido" });
	}

	const anyReq: any = req;
	const userId = anyReq.user?.sub;
	if (!userId) return reply.code(401).send({ message: "Token inválido: sin sub" });

	const user = await service.findById(userId);
	if (!user) return reply.code(401).send({ message: "Usuario no encontrado" });

	anyReq.user = user;
}

