import { FastifyInstance } from "fastify";
import { listCobranza, getCobranzaById, createCobranza } from "./cobranza.controller.js";

export default async function cobranzaRoutes(app: FastifyInstance) {
	app.get("/cobranza", listCobranza);
	app.get("/cobranza/:id", getCobranzaById);
	app.post("/cobranza", createCobranza);
}
