import { FastifyInstance } from "fastify";
import { listAsambleas, getAsambleaById, createAsamblea } from "./asamblea.controller.js";

export default async function asambleasRoutes(app: FastifyInstance) {
	app.get("/asambleas", listAsambleas);
	app.get("/asambleas/:id", getAsambleaById);
	app.post("/asambleas", createAsamblea);
}
