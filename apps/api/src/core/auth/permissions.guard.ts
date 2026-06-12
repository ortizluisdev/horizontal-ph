import type { FastifyReply, FastifyRequest } from "fastify";

// ─── Guard de roles ───────────────────────────────────────────────────────────
// Uso: preHandler: [authMiddleware, permitRoles("administrador", "gerente")]

export function permitRoles(...allowed: string[]) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;

    if (!user) {
      return reply.code(401).send({ error: "UNAUTHORIZED", message: "No autenticado" });
    }

    const roleName: string | null = user.role_name ?? user.role ?? null;

    if (!roleName) {
      return reply.code(403).send({ error: "FORBIDDEN", message: "Rol no asignado" });
    }

    if (!allowed.includes(roleName)) {
      return reply.code(403).send({
        error:   "FORBIDDEN",
        message: `Acceso denegado. Se requiere uno de: ${allowed.join(", ")}`,
      });
    }
  };
}

// ─── Guard por nivel de acceso ────────────────────────────────────────────────
// Uso: preHandler: [authMiddleware, requireAccessLevel(2)]
// Niveles: 0=basic, 1=staff, 2=admin, 3=super-admin

export function requireAccessLevel(minLevel: number) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    const user  = (req as any).user;
    const level = user?.nivel_acceso ?? 0;

    if (level < minLevel) {
      return reply.code(403).send({
        error:   "FORBIDDEN",
        message: `Se requiere nivel de acceso ${minLevel} o superior`,
      });
    }
  };
}

export default permitRoles;