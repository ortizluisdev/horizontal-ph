import "dotenv/config";
import Fastify             from "fastify";
import cors                from "@fastify/cors";
import jwt                 from "@fastify/jwt";
import { env }             from "./config/env.js";
import { httpErrorHandler } from "./core/errors/http.error.handler.js";
import { checkDatabaseConnection } from "./core/database/pg.client.js";
import logger              from "./core/logger/logger.js";

// ── Módulos ───────────────────────────────────────────────────────────────────
import authRoutes          from "./modules/auth/auth.routes.js";
import usuariosRoutes      from "./modules/usuarios/usuarios.routes.js";
import unidadesRoutes      from "./modules/unidades/unidades.routes.js";
import conjuntosRoutes     from "./modules/conjuntos/conjunto.routes.js";
import asambleasRoutes     from "./modules/asambleas/asamblea.routes.js";
import cobranzaRoutes      from "./modules/cobranza/cobranza.routes.js";
import contabilidadRoutes  from "./modules/contabilidad/contabilidad.routes.js";
import pqrsRoutes          from "./modules/pqrs/pqrs.routes.js";
import notificacionesRoutes from "./modules/notificaciones/notificacion.routes.js";
import normativaRoutes     from "./modules/normativa/normativa.routes.js";

// ─── Crear instancia ──────────────────────────────────────────────────────────

const app = Fastify({
  logger:     false,
  trustProxy: true,
});

// ─── Plugins globales ─────────────────────────────────────────────────────────

await app.register(cors, {
  origin:      env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
  sign:   { expiresIn: env.JWT_EXPIRES_IN },
});

// ─── Error handler global ─────────────────────────────────────────────────────

app.setErrorHandler(httpErrorHandler);

// ─── Rutas bajo prefijo /api/v1 ───────────────────────────────────────────────

await app.register(async (api) => {
  await api.register(authRoutes);
  await api.register(usuariosRoutes);
  await api.register(unidadesRoutes);
  await api.register(conjuntosRoutes);
  await api.register(asambleasRoutes);
  await api.register(cobranzaRoutes);
  await api.register(contabilidadRoutes);
  await api.register(pqrsRoutes);
  await api.register(notificacionesRoutes);
  await api.register(normativaRoutes);
}, { prefix: "/api/v1" });

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", async () => {
  const dbOk = await checkDatabaseConnection();
  return {
    status:    dbOk ? "ok" : "degraded",
    db:        dbOk ? "connected" : "error",
    timestamp: new Date().toISOString(),
    env:       env.NODE_ENV,
    version:   "1.0.0",
  };
});

// ─── Arranque ─────────────────────────────────────────────────────────────────

try {
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    logger.error("No se pudo conectar a la base de datos. Abortando.");
    process.exit(1);
  }

  await app.listen({ port: env.PORT, host: "0.0.0.0" });

  logger.info(`🚀 Servidor en http://localhost:${env.PORT}`);
  logger.info(`❤️  Health:  http://localhost:${env.PORT}/health`);
} catch (err) {
  logger.error({ err }, "Error al iniciar el servidor");
  process.exit(1);
}

export default app;