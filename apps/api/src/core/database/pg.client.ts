import pg from "pg";
import { env } from "../../config/env.js";
import logger from "../logger/logger.js";

const { Pool } = pg;

// ─── Pool de conexiones ───────────────────────────────────────────────────────

export const pool = new Pool({
  connectionString:       env.DATABASE_URL,
  max:                    20,   // máximo de conexiones simultáneas
  idleTimeoutMillis:      30_000,
  connectionTimeoutMillis: 5_000,
  allowExitOnIdle:        true,
});

// Loguear errores inesperados del pool (no bloquean el proceso)
pool.on("error", (err) => {
  logger.error({ err }, "Error inesperado en el pool de PostgreSQL");
});

// ─── Health check ─────────────────────────────────────────────────────────────

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (err) {
    logger.error({ err }, "Error al conectar a la base de datos");
    return false;
  }
}

// ─── Transacciones helper ─────────────────────────────────────────────────────

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─── Multi-schema (multitenant por schema) ────────────────────────────────────

export async function getClientForTenant(schema: string) {
  const sanitized = schema.replace(/[^a-zA-Z0-9_]/g, ""); // evitar SQL injection
  const client    = await pool.connect();
  await client.query(`SET search_path TO "${sanitized}", public`);
  return client;
}