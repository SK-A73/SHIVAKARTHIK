const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.dosrreuhogluiguyxwze:shivakumar@17@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('orders', 'orderitems', 'Orders', 'OrderItems')
      ORDER BY table_name, ordinal_position
    `);
    console.log(res.rows);
  } catch(e) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
}
check();
