const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.dosrreuhogluiguyxwze:shivakumar@17@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

const updateAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('karthik@19', salt);

    // Update the existing admin record (usually ID 1)
    await pool.query(
      `UPDATE Admins SET username = $1, password = $2 WHERE id = 1`,
      ['karthik', hashedPassword]
    );
    console.log('Successfully updated admin credentials.');
  } catch (err) {
    console.error('Error updating admin:', err.message);
  } finally {
    process.exit(0);
  }
};
updateAdmin();
