import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5432/horizontal_ph",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function getClientForTenant(schema: string) {
  const client = await pool.connect();
  await client.query(`SET search_path TO "${schema}", public`);
  return client;
}