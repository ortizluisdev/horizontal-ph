import type { FastifyReply, FastifyRequest } from "fastify";
import { UsuarioService } from "./usuarios.service";
import { usuarioSchema } from "./usuarios.schema";

const service = new UsuarioService();

type CreateUsuarioRequest = FastifyRequest<{ Body: unknown }>;

export async function getUsuarios(_: FastifyRequest, reply: FastifyReply) {
  const usuarios = await service.list();
  return reply.send(usuarios);
}

export async function getUsuarioById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const usuario = await service.findById(req.params.id);
  if (!usuario) {
    return reply.status(404).send({ message: "Usuario no encontrado" });
  }
  return reply.send(usuario);
}

export async function createUsuario(req: CreateUsuarioRequest, reply: FastifyReply) {
  const usuario = usuarioSchema.parse(req.body);
  const created = await service.create(usuario);
  return reply.status(201).send(created);
}
