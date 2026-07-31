const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper for db queries using promises
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const initDatabase = async () => {
  try {
    // Enable foreign keys
    await runQuery(`PRAGMA foreign_keys = ON;`);

    // Admins table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS Admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS Products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        featured INTEGER DEFAULT 0,
        hidden INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // OrderItems table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS OrderItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT NOT NULL,
        productId INTEGER NOT NULL,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    const adminExist = await getQuery(`SELECT * FROM Admins WHERE username = ?`, ['admin']);
    if (!adminExist) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await runQuery(`INSERT INTO Admins (username, password) VALUES (?, ?)`, ['admin', hashedPassword]);
      console.log('Seeded default admin account (admin / admin123)');
    }

    // Seed default shop settings if not exists
    const settingsExist = await getQuery(`SELECT * FROM Settings LIMIT 1`);
    if (!settingsExist) {
      await runQuery(`
        INSERT INTO Settings (shopName, whatsappNumber, address, instagram, facebook, logo, banner)
        VALUES (?, ?, ?, ?, ?, ?, ?)
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
      await runQuery(`UPDATE Settings SET whatsappNumber = ? WHERE id = ?`, ['919148572774', settingsExist.id]);
    }

    // Seed sample products if empty
    const productCount = await getQuery(`SELECT COUNT(*) as count FROM Products`);
    if (productCount.count === 0) {
      await runQuery(`
        INSERT INTO Products (name, category, price, description, image, stock, featured, hidden)
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Premium Silk Saree', 'Clothing', 1250.00, 'Handcrafted authentic silk saree with intricate traditional patterns and vibrant finish.', 'sample_saree.jpg', 25, 1, 0,
        'Wireless Noise Cancelling Headphones', 'Electronics', 3499.00, 'High fidelity audio headphones with active noise cancellation and 30hr battery life.', 'sample_headphones.jpg', 15, 1, 0,
        'Designer Leather Handbag', 'Fashion', 2199.00, 'Genuine Italian leather handbag featuring gold accent hardware and multi-compartment storage.', 'sample_handbag.jpg', 10, 0, 0
      ]);
      console.log('Seeded sample products');
    }

  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

initDatabase();

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery
};
