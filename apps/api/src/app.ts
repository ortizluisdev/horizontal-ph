import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import unidadesRoutes from "./modules/unidades/unidades.routes";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";

const app = Fastify({ logger: false });

await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET ?? "secreto_temporal" });
await app.register(unidadesRoutes);
await app.register(usuariosRoutes);

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