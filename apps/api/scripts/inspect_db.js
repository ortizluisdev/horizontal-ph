import { Client } from 'pg';

const conn = 'postgresql://postgres:Admin1234*@localhost:5432/horizontal_ph';
const client = new Client({ connectionString: conn });

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('auth_roles','auth_permisos','auth_roles_permisos','users','user_sessions','user_audit_log')
    ORDER BY table_name, column_name
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch((err) => {
  console.error('ERROR', err.message);
  process.exit(1);
});
