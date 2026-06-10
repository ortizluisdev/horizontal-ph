import type { FastifyReply, FastifyRequest } from "fastify";

export function permitRoles(...allowed: string[]) {
	return async function (req: FastifyRequest, reply: FastifyReply) {
		const anyReq: any = req;
		const user = anyReq.user;
		if (!user) return reply.code(401).send({ message: "No autenticado" });
		// `user.role_id` contiene el id del role; si se desea comparar por nombre, se podría cargar role
		// En nuestro modelo inicial guardamos role_id; para simplificar, permitimos pasar nombres de roles
		// y también aceptamos comparar contra `user.role_name` si se hubiera adjuntado.
		const roleName = (user as any).role_name || (user as any).role || null;
		if (!roleName) return reply.code(403).send({ message: "Rol no asignado" });
		if (!allowed.includes(roleName)) return reply.code(403).send({ message: "Permiso denegado" });
	};
}

export default permitRoles;
