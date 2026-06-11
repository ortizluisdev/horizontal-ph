import { FastifyInstance } from "fastify";
import { listMovimientos, getMovimientoById, createMovimiento } from "./contabilidad.controller.js";

export default async function contabilidadRoutes(app: FastifyInstance) {
	app.get("/contabilidad", listMovimientos);
	app.get("/contabilidad/:id", getMovimientoById);
	app.post("/contabilidad", createMovimiento);
}
