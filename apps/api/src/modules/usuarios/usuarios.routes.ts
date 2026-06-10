import { FastifyInstance } from "fastify";
import { createUsuario, getUsuarios, getUsuarioById } from "./usuarios.controller";

export default async function usuariosRoutes(app: FastifyInstance) {
  app.get("/usuarios", getUsuarios);
  app.get("/usuarios/:id", getUsuarioById);
  app.post("/usuarios", createUsuario);
}
