const sqlite3 = require('sqlite3');
const { Pool } = require('pg');

const db = new sqlite3.Database('./database/products.db');
const pool = new Pool({
  connectionString: 'postgresql://postgres.dosrreuhogluiguyxwze:shivakumar@17@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

const migrate = async () => {
  db.all('SELECT * FROM Products', async (err, rows) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('Found ' + rows.length + ' products in SQLite.');
    try {
      await pool.query('DELETE FROM "products";').catch(e => pool.query('DELETE FROM Products;'));
      for (const row of rows) {
        await pool.query(
          'INSERT INTO Products (id, name, category, price, description, image, stock, featured, hidden) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [row.id, row.name, row.category, row.price, row.description, row.image, row.stock, row.featured, row.hidden]
        );
      }
      
      // Update the sequence for the id column so new products don't clash
      await pool.query("SELECT setval(pg_get_serial_sequence('Products', 'id'), coalesce(max(id),0) + 1, false) FROM Products;");
      
      console.log('Done migrating products.');
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
};

migrate();
