import type { FastifyReply, FastifyRequest } from "fastify";
import { pool } from "../database/pg.client.js";

// ─── Tenant Middleware ────────────────────────────────────────────────────────
// Resuelve el tenant desde JWT (prioridad), header x-tenant-id o subdominio.
// Solo necesario para rutas públicas (login, register) — las rutas protegidas
// ya tienen el tenant_id dentro del usuario cargado por authMiddleware.

export default async function tenantMiddleware(
  req:   FastifyRequest,
  reply: FastifyReply
) {
  // Prioridad 1: tenant desde el JWT ya procesado por authMiddleware
  const userTenantId = (req as any).user?.tenant_id;
  if (userTenantId) {
    (req as any).tenantId = userTenantId;
    return;
  }

  // Prioridad 2: header explícito x-tenant-id
  const headerTenantId = req.headers["x-tenant-id"] as string | undefined;
  if (headerTenantId) {
    const valid = await validateTenantId(headerTenantId);
    if (!valid) {
      return reply.code(400).send({ error: "BAD_REQUEST", message: "Tenant no válido" });
    }
    (req as any).tenantId = headerTenantId;
    return;
  }

  // Prioridad 3: subdominio (ej: miconjunto.horizontal-ph.com → miconjunto)
  const subdomain = req.hostname?.split(".")[0];
  if (subdomain && subdomain !== "www" && subdomain !== "api") {
    const tenant = await findTenantBySubdomain(subdomain);
    if (tenant) {
      (req as any).tenantId = tenant.id;
      return;
    }
  }

  // Sin tenant identificado — solo bloqueamos si la ruta lo requiere explícitamente
  (req as any).tenantId = null;
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

async function validateTenantId(id: string): Promise<boolean> {
  try {
    const res = await pool.query(
      `SELECT 1 FROM tenants WHERE id = $1 AND activo = true LIMIT 1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  } catch {
    return false;
  }
}

async function findTenantBySubdomain(subdomain: string) {
  try {
    const res = await pool.query(
      `SELECT id FROM tenants WHERE subdominio = $1 AND activo = true LIMIT 1`,
      [subdomain]
    );
    return res.rows[0] ?? null;
  } catch {
    return null;
  }
}