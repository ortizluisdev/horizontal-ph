import { FastifyInstance } from "fastify";
import { listConjuntos, getConjuntoById, createConjunto } from "./conjunto.controller.js";

export default async function conjuntosRoutes(app: FastifyInstance) {
	app.get("/conjuntos", listConjuntos);
	app.get("/conjuntos/:id", getConjuntoById);
	app.post("/conjuntos", createConjunto);
}
