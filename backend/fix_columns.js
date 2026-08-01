const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.dosrreuhogluiguyxwze:shivakumar@17@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

const queries = [
  'ALTER TABLE Admins RENAME COLUMN createdat TO "createdAt";',
  'ALTER TABLE Products RENAME COLUMN createdat TO "createdAt";',
  'ALTER TABLE Products RENAME COLUMN updatedat TO "updatedAt";',
  'ALTER TABLE Orders RENAME COLUMN customername TO "customerName";',
  'ALTER TABLE Orders RENAME COLUMN totalamount TO "totalAmount";',
  'ALTER TABLE Orders RENAME COLUMN createdat TO "createdAt";',
  'ALTER TABLE OrderItems RENAME COLUMN orderid TO "orderId";',
  'ALTER TABLE OrderItems RENAME COLUMN productid TO "productId";',
  'ALTER TABLE OrderItems RENAME COLUMN productname TO "productName";',
  'ALTER TABLE Settings RENAME COLUMN shopname TO "shopName";',
  'ALTER TABLE Settings RENAME COLUMN whatsappnumber TO "whatsappNumber";'
];

async function fix() {
  for (const q of queries) {
    try {
      await pool.query(q);
      console.log('Success:', q);
    } catch(e) {
      console.error('Failed:', q, e.message);
    }
  }
  process.exit(0);
}
fix();
