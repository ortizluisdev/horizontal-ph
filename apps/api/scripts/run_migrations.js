import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

dotenv.config();

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.DB_USER ?? 'postgres';
  const password = process.env.DB_PASSWORD ?? 'password';
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  const database = process.env.DB_NAME ?? process.env.DATABASE ?? 'horizontal_ph';

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function run() {
  const conn = getDatabaseUrl();
  if (!conn) {
    console.error('DATABASE_URL no está definida');
    process.exit(1);
  }

  const client = new Client({ connectionString: conn });
  await client.connect();

  try {
    console.log('Creando extensión pgcrypto si falta...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const base = path.resolve(__dirname, '../../../');
    const migrationsDir = path.join(base, 'packages/database/migrations');
    if (!fs.existsSync(migrationsDir) || !fs.statSync(migrationsDir).isDirectory()) {
      throw new Error(`Directorio de migraciones no encontrado: ${migrationsDir}`);
    }
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((file) => path.join(migrationsDir, file));

    for (const filePath of files) {
      console.log('Ejecutando', path.basename(filePath));
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
    }

    console.log('Migraciones aplicadas correctamente');
  } catch (err) {
    console.error('Error aplicando migraciones:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
