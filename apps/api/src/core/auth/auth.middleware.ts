import type { FastifyReply, FastifyRequest } from "fastify";
import { pool } from "../database/pg.client.js";

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Verifica el JWT, carga el usuario desde BD y lo adjunta a req.user
// con todos sus datos (incluyendo tenant_id y role_name).

export default async function authMiddleware(
  req:   FastifyRequest,
  reply: FastifyReply
) {
  // 1. Verificar firma del JWT
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: "UNAUTHORIZED", message: "Token inválido o expirado" });
  }

  const payload = (req as any).user as any;
  const userId  = payload?.sub;

  if (!userId) {
    return reply.code(401).send({ error: "UNAUTHORIZED", message: "Token sin identificador de usuario" });
  }

  // 2. Cargar usuario completo desde BD (incluye tenant_id, role_name, activo, bloqueado)
  const res = await pool.query(
    `SELECT u.id, u.tenant_id, u.nombre, u.email, u.role_id,
            r.nombre AS role_name, r.nivel_acceso,
            u.unidad_id, u.conjunto_id, u.tipo_usuario,
            u.activo, u.bloqueado
     FROM users u
     LEFT JOIN auth_roles r ON r.id = u.role_id
     WHERE u.id = $1 AND u.deleted_at IS NULL
     LIMIT 1`,
    [userId]
  );

  const user = res.rows[0];

  if (!user) {
    return reply.code(401).send({ error: "UNAUTHORIZED", message: "Usuario no encontrado" });
  }

  // 3. Validar estado del usuario
  if (!user.activo) {
    return reply.code(403).send({ error: "FORBIDDEN", message: "Cuenta inactiva" });
  }

  if (user.bloqueado) {
    return reply.code(403).send({ error: "FORBIDDEN", message: "Cuenta bloqueada" });
  }

  // 4. Adjuntar usuario completo al request
  (req as any).user = user;
}