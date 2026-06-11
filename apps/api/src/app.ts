import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import unidadesRoutes from "./modules/unidades/unidades.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import conjuntosRoutes from "./modules/conjuntos/conjunto.routes.js";
import asambleasRoutes from "./modules/asambleas/asamblea.routes.js";
import cobranzaRoutes from "./modules/cobranza/cobranza.routes.js";
import contabilidadRoutes from "./modules/contabilidad/contabilidad.routes.js";
import pqrsRoutes from "./modules/pqrs/pqrs.routes.js";
import notificacionesRoutes from "./modules/notificaciones/notificacion.routes.js";
import normativaRoutes from "./modules/normativa/normativa.routes.js";

const app = Fastify({ logger: false });

await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET ?? "secreto_temporal" });
await app.register(unidadesRoutes);
await app.register(usuariosRoutes);
await app.register(authRoutes);
await app.register(conjuntosRoutes);
await app.register(asambleasRoutes);
await app.register(cobranzaRoutes);
await app.register(contabilidadRoutes);
await app.register(pqrsRoutes);
await app.register(notificacionesRoutes);
await app.register(normativaRoutes);

app.get("/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    proyecto: "horizontal-ph"
  };
});

const PORT = Number(process.env.PORT) || 3000;

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
} catch (err) {
  console.error(err);
  process.exit(1);
}