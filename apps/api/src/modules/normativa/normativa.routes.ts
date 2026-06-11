import { FastifyInstance } from "fastify";
import { listNormativas, getNormativaById, createNormativa } from "./normativa.controller.js";

export default async function normativaRoutes(app: FastifyInstance) {
	app.get("/normativa", listNormativas);
	app.get("/normativa/:id", getNormativaById);
	app.post("/normativa", createNormativa);
}
