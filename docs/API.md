# API Documentation

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication APIs (`/api/auth`)

### Admin Login
- **POST** `/auth/login`
- **Body:** `{ "username": "admin", "password": "admin123" }`
- **Response (200):**
  ```json
  {
    "success": true,
    "token": "<JWT_TOKEN>",
    "admin": { "id": 1, "username": "admin" }
  }
  ```

### Verify Admin Token
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200):** Admin object info

---

## 2. Product APIs (`/api/products`)

### Get All Products
- **GET** `/products`
- **Query Params:** `category`, `search`, `featured=true`, `includeHidden=true` (admin)
- **Response (200):** Array of product objects

### Get Product Details
- **GET** `/products/:id`
- **Response (200):** Single product object

### Create Product (Admin Only)
- **POST** `/products`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: multipart/form-data`
- **Form Data:** `name`, `category`, `price`, `description`, `stock`, `featured`, `hidden`, `image` (file)

### Update Product (Admin Only)
- **PUT** `/products/:id`
- **Form Data:** optional updated fields and optional image file

### Delete Product (Admin Only)
- **DELETE** `/products/:id`

### Toggle Product Visibility (Admin Only)
- **PATCH** `/products/:id/visibility`

---

## 3. Order APIs (`/api/orders`)

### Create Order (Customer)
- **POST** `/orders`
- **Body:** `{ "customerName": "Rahul", "phone": "9876543210", "productId": 1, "quantity": 2 }`
- **Response (201):** Returns created Order details with `whatsappUrl` for auto-redirect.

### Get All Orders (Admin Only)
- **GET** `/orders`
- **Query Params:** `search`, `status`

### Get Single Order (Admin Only)
- **GET** `/orders/:id`

### Update Order Status (Admin Only)
- **PUT** `/orders/:id/status`
- **Body:** `{ "status": "Confirmed" }` // Options: 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'

---

## 4. Dashboard Stats API (`/api/dashboard`)

### Get Overview Stats (Admin Only)
- **GET** `/dashboard/stats`
- **Response (200):** Total Products, Total Orders, Pending, Confirmed, Delivered, Cancelled.

---

## 5. Settings APIs (`/api/settings`)

### Get Shop Settings
- **GET** `/settings`

### Update Shop Settings (Admin Only)
- **PUT** `/settings`
- **Body:** `shopName`, `whatsappNumber`, `address`, `instagram`, `facebook`
