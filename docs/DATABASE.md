# SQLite Database Schema Documentation

Database File Path: `backend/database/products.db`

---

## Tables Overview

### 1. `Admins`
Stores administrator accounts. Password hashed with bcryptjs.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `username` (TEXT UNIQUE NOT NULL)
- `password` (TEXT NOT NULL)
- `createdAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 2. `Products`
Stores shop products available for customer view and ordering.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT NOT NULL)
- `category` (TEXT NOT NULL)
- `price` (REAL NOT NULL)
- `description` (TEXT NOT NULL)
- `image` (TEXT NOT NULL)
- `stock` (INTEGER DEFAULT 0)
- `featured` (INTEGER DEFAULT 0)
- `hidden` (INTEGER DEFAULT 0)
- `createdAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `updatedAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 3. `Orders`
Stores order records generated via customer order popups.
- `id` (TEXT PRIMARY KEY) - e.g. `ORD-20260727-0001`
- `customerName` (TEXT NOT NULL)
- `phone` (TEXT NOT NULL)
- `status` (TEXT DEFAULT 'Pending') - Options: `Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`
- `totalAmount` (REAL NOT NULL)
- `createdAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 4. `OrderItems`
Stores individual line items within an order.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `orderId` (TEXT NOT NULL) - Foreign Key to `Orders.id`
- `productId` (INTEGER) - Foreign Key to `Products.id`
- `productName` (TEXT NOT NULL)
- `quantity` (INTEGER NOT NULL)
- `price` (REAL NOT NULL)
- `total` (REAL NOT NULL)

### 5. `Settings`
Stores shop configuration such as WhatsApp ordering phone number.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `shopName` (TEXT NOT NULL)
- `whatsappNumber` (TEXT NOT NULL)
- `address` (TEXT)
- `instagram` (TEXT)
- `facebook` (TEXT)
- `logo` (TEXT)
- `banner` (TEXT)
