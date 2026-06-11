import { FastifyInstance } from "fastify";
import { listPqrs, getPqrsById, createPqrs } from "./pqrs.controller.js";

export default async function pqrsRoutes(app: FastifyInstance) {
	app.get("/pqrs", listPqrs);
	app.get("/pqrs/:id", getPqrsById);
	app.post("/pqrs", createPqrs);
}
