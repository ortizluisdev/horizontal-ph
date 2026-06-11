const { Client } = require('pg');
const fs = require('fs').promises;

async function run() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('DATABASE_URL no está definida');
    process.exit(1);
  }

  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    console.log('Creando extensión pgcrypto si falta...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    const files = [
      'packages/database/migrations/009_create_auth.sql',
      'packages/database/migrations/010_create_refresh_tokens.sql',
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
