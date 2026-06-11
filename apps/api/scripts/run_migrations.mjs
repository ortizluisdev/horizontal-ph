import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

async function run() {
  let conn = process.env.DATABASE_URL;
  // intentar cargar .env en la raíz si no existe DATABASE_URL
  if (!conn) {
    try {
      // usar process.cwd() para resolver la raíz cuando se ejecuta desde apps/api
      const repoRoot = path.resolve(process.cwd(), '../..');
      const envPath = path.join(repoRoot, '.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      const lines = envContent.split(/\r?\n/);
      const env = {};
      for (const l of lines) {
        if (!l || l.trim().startsWith('#')) continue;
        const idx = l.indexOf('=');
        if (idx === -1) continue;
        const key = l.slice(0, idx).trim();
        let val = l.slice(idx + 1).trim();
        // remove surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
      // construir DATABASE_URL si tenemos los campos
      if (env.DB_USER && env.DB_PASSWORD && env.DB_HOST && env.DB_PORT && env.DB_NAME) {
        conn = `postgres://${env.DB_USER}:${encodeURIComponent(env.DB_PASSWORD)}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
        console.log('Usando DATABASE_URL construida desde .env');
      }
    } catch (e) {
      // ignore
    }
  }
  if (!conn) {
    console.error('DATABASE_URL no está definida ni pudo construirse desde .env');
    process.exit(1);
  }

  let client;
  // parse conn constructed from .env into parts and create client with explicit config
  const url = conn; // conn was constructed as postgres://user:pass@host:port/db
  const m = url.match(/postgres:\/\/([^:]+):([^@]+)@([^:\/]+):(\d+)\/(.+)/);
  if (!m) {
    console.error('No se pudo parsear la cadena de conexión.');
    process.exit(1);
  }
  const [, user, password, host, port, database] = m;
  client = new Client({ host, port: Number(port), user, password: decodeURIComponent(password), database });
  await client.connect();
  try {
    console.log('Creando extensión pgcrypto si falta...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    const base = path.resolve(process.cwd(), '../..');
    const files = [
      path.join(base, 'packages', 'database', 'migrations', '009_create_auth.sql'),
      path.join(base, 'packages', 'database', 'migrations', '010_create_refresh_tokens.sql'),
    ];

    for (const f of files) {
      console.log('Ejecutando', f);
      const sql = await fs.readFile(f, 'utf8');
      await client.query(sql);
    }

    console.log('Migraciones aplicadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error aplicando migraciones:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
