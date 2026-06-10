import { FastifyInstance } from "fastify";
import { createUnidad, getUnidades } from "./unidades.controller.js";

export default async function unidadesRoutes(app: FastifyInstance) {
  app.get("/unidades", getUnidades);
  app.post("/unidades", createUnidad);
}
