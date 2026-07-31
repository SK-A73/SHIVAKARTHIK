const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper to convert SQLite ? to Postgres $1, $2
const formatSql = (sql) => {
  let count = 1;
  return sql.replace(/\?/g, () => `$${count++}`);
};

// Helper for db queries using async/await
const runQuery = async (sql, params = []) => {
  const result = await pool.query(formatSql(sql), params);
  return result;
};

const getQuery = async (sql, params = []) => {
  const result = await pool.query(formatSql(sql), params);
  return result.rows[0];
};

const allQuery = async (sql, params = []) => {
  const result = await pool.query(formatSql(sql), params);
  return result.rows;
};

const initDatabase = async () => {
  try {
    // Admins table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS Admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS Products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        featured INTEGER DEFAULT 0,
        hidden INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Orders table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS Orders (
        id TEXT PRIMARY KEY,
        customerName TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        totalAmount REAL NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // OrderItems table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS OrderItems (
        id SERIAL PRIMARY KEY,
        orderId TEXT NOT NULL,
        productId INTEGER,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE SET NULL
      );
    `);

    // Settings table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS Settings (
        id SERIAL PRIMARY KEY,
        shopName TEXT NOT NULL,
        whatsappNumber TEXT NOT NULL,
        address TEXT,
        instagram TEXT,
        facebook TEXT,
        logo TEXT,
        banner TEXT
      );
    `);

    // Seed default admin if not exists
    const adminExist = await getQuery(`SELECT * FROM Admins WHERE username = $1`, ['admin']);
    if (!adminExist) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await runQuery(`INSERT INTO Admins (username, password) VALUES ($1, $2)`, ['admin', hashedPassword]);
      console.log('Seeded default admin account (admin / admin123)');
    }

    // Seed default shop settings if not exists
    const settingsExist = await getQuery(`SELECT * FROM Settings LIMIT 1`);
    if (!settingsExist) {
      await runQuery(`
        INSERT INTO Settings (shopName, whatsappNumber, address, instagram, facebook, logo, banner)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'SHIVA KARTHIK GANESHA COLLECTIONS',
        '919148572774',
        '123 Commercial Street, Suite 400, NY',
        'https://instagram.com/shop',
        'https://facebook.com/shop',
        '',
        ''
      ]);
      console.log('Seeded default shop settings');
    } else {
      // Ensure target WhatsApp number is updated to 919148572774
      await runQuery(`UPDATE Settings SET whatsappNumber = $1 WHERE id = $2`, ['919148572774', settingsExist.id]);
    }

    // Seed sample products if empty
    const productCount = await getQuery(`SELECT COUNT(*) as count FROM Products`);
    if (parseInt(productCount.count) === 0) {
      await runQuery(`
        INSERT INTO Products (name, category, price, description, image, stock, featured, hidden)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8),
        ($9, $10, $11, $12, $13, $14, $15, $16),
        ($17, $18, $19, $20, $21, $22, $23, $24)
      `, [
        'Premium Silk Saree', 'Clothing', 1250.00, 'Handcrafted authentic silk saree with intricate traditional patterns and vibrant finish.', 'sample_saree.jpg', 25, 1, 0,
        'Wireless Noise Cancelling Headphones', 'Electronics', 3499.00, 'High fidelity audio headphones with active noise cancellation and 30hr battery life.', 'sample_headphones.jpg', 15, 1, 0,
        'Designer Leather Handbag', 'Fashion', 2199.00, 'Genuine Italian leather handbag featuring gold accent hardware and multi-compartment storage.', 'sample_handbag.jpg', 10, 0, 0
      ]);
      console.log('Seeded sample products');
    }
    
    console.log('Connected to PostgreSQL database and schema initialized successfully.');

  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Don't auto-initialize if there's a placeholder password (it will crash)
if (!process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
    initDatabase();
} else {
    console.warn('⚠️ PostgreSQL initialization skipped. Replace [YOUR-PASSWORD] in .env file.');
}

module.exports = {
  pool,
  runQuery,
  getQuery,
  allQuery
};
