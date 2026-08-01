const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.dosrreuhogluiguyxwze:shivakumar@17@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

const migrate = async () => {
  try {
    // Check if column exists to avoid errors on multiple runs
    const colCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='cloudinary_public_id';
    `);
    
    if (colCheck.rows.length === 0) {
      await pool.query('ALTER TABLE Products RENAME COLUMN image TO image_url;');
      await pool.query('ALTER TABLE Products ADD COLUMN cloudinary_public_id TEXT;');
      console.log('Successfully altered Products table schema.');
    } else {
      console.log('Schema already updated.');
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
};
migrate();
