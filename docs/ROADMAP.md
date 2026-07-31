# Project Architecture & Roadmap

## Architecture Overview
The application is structured into a clean decoupled client-server model:
- **Backend**: Express.js REST API using SQLite (`sqlite3`) as an embedded relational database. JWT provides stateless session management for admin security. Multer acts as the file engine uploading product images into `backend/uploads/products`.
- **Frontend**: Single Page Application built with React (Vite), React Router DOM for multi-page routing, Axios for HTTP client operations, and custom CSS for a dark glassmorphic UI.

## Completed Features
- [x] Auto-created SQLite database schema with seeding (Default Admin & Shop Settings)
- [x] JWT Admin Login with password hashing (`bcryptjs`)
- [x] Product CRUD operations with image uploads and visibility toggles
- [x] Category filtering, live search, and featured product highlights
- [x] Interactive WhatsApp Order Popup modal
- [x] Auto-generation of unique Order IDs (`ORD-YYYYMMDD-XXXX`)
- [x] Direct WhatsApp auto-redirection with preformatted text messages
- [x] Admin Dashboard featuring live KPI stats, Order search, and Status updating
- [x] Shop settings configuration (Shop Name, WhatsApp number, Address, Socials)
- [x] Responsive layout across Mobile, Tablet, and Desktop screens
