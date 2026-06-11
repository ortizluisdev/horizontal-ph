import { FastifyInstance } from "fastify";
import { registerHandler, loginHandler, meHandler, refreshHandler, logoutHandler, changePasswordHandler } from "./auth.controller.js";
import authMiddleware from "../../core/auth/auth.middleware.js";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", registerHandler);
  app.post("/auth/login", loginHandler);

  // rutas públicas
  app.post("/auth/refresh", refreshHandler);

  // rutas protegidas
  app.get("/auth/me", { preHandler: authMiddleware }, meHandler);
  app.post("/auth/logout", { preHandler: authMiddleware }, logoutHandler);
  app.patch("/auth/password", { preHandler: authMiddleware }, changePasswordHandler);
}
