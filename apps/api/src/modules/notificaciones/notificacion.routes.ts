import { FastifyInstance } from "fastify";
import { listNotificaciones, getNotificacionById, createNotificacion } from "./notificacion.controller.js";

export default async function notificacionesRoutes(app: FastifyInstance) {
	app.get("/notificaciones", listNotificaciones);
	app.get("/notificaciones/:id", getNotificacionById);
	app.post("/notificaciones", createNotificacion);
}
