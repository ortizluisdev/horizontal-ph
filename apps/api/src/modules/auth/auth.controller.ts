import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";

const service = new AuthService();

export async function registerHandler(req: FastifyRequest, reply: FastifyReply) {
  const payload = registerSchema.parse(req.body);
  try {
    const user = await service.register({
      nombre: payload.nombre,
      email: payload.email,
      password: payload.password,
      roleName: payload.roleName,
      unidadId: payload.unidadId ?? null,
    });

    return reply.code(201).send(user);
  } catch (err) {
    return reply.code(400).send({ message: "Error creando usuario", detail: (err as any).message });
  }
}

export async function loginHandler(req: FastifyRequest, reply: FastifyReply) {
  const payload = loginSchema.parse(req.body);
  const user = await service.login(payload.email, payload.password);
  if (!user) return reply.code(401).send({ message: "Credenciales inválidas" });

  // firmar JWT con sub = user.id
  const roleForToken = (user as any).role_name ?? (user as any).role_id;
  const token = await reply.jwtSign({ sub: user.id, email: user.email, role: roleForToken });
  return reply.send({ token, user });
}

export async function meHandler(req: FastifyRequest, reply: FastifyReply) {
  // `auth.middleware` agrega `request.user`
  const anyReq: any = req;
  if (!anyReq.user) return reply.code(401).send({ message: "No autenticado" });
  return reply.send(anyReq.user);
}
