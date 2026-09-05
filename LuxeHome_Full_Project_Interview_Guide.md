# LuxeHome – Premium On-Demand Home Services Platform
## Full Project Architecture, Role-Based Access Control (RBAC) & Technical Interview Preparation Guide

---

## 1. Executive Summary & Tech Stack Overview

**LuxeHome** is a full-stack, enterprise-grade web application designed for booking and managing luxury on-demand home services (Cleaning, Interior Design, Plumbing, Smart Security, Garden Care, HVAC). It features strict **Role-Based Access Control (RBAC)** separating the **Client Experience** from the **Administrative Operations Portal**.

### Technology Stack Breakdown
- **Frontend**: React 19, Vite, Modern Vanilla CSS (Dark Luxury Glassmorphic Design, CSS variables, backdrop filters, responsive flex/grid layouts), state-driven single page routing with route guards.
- **Backend**: Node.js & Express.js REST API server, CORS configuration, custom JSON validation, IP logging audit system.
- **Database**: MySQL relational database (Connection pooling with `mysql2/promise`, foreign key cascading constraints, unique indexes, auto-increment primary keys).
- **Security & Cryptography**: Password hashing via `bcryptjs` with 10 salt rounds, case-insensitive dual-identifier authentication (Email OR Username), SQL injection protection via parameterized queries, server-side role validation middleware.

---

## 2. System Architecture & Component Hierarchy

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT TIER                                      |
|  React 19 Single Page Application                                                 |
|  ├── AuthPage (Client Login, Client Register, Admin Portal Login)                 |
|  ├── Client Experience (HomePage, Category View, Service Detail, MyBookings)      |
|  └── Admin Portal (AdminDashboard: Overview, Bookings, Services, Users, RBAC)    |
+------------------------------------------+----------------------------------------+
                                           | HTTP Requests (REST / JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                                  SERVER TIER                                      |
|  Node.js + Express.js API Server (Port 5000)                                       |
|  ├── CORS & JSON Body Parsing Middleware                                          |
|  ├── Authentication Subsystem (bcryptjs 10 Rounds, Dual Identifier Matching)      |
|  ├── requireAdmin Middleware (x-user-role validation & Route Guards)              |
|  └── REST Endpoints: /api/login, /api/signup, /api/services, /api/bookings, etc.  |
+------------------------------------------+----------------------------------------+
                                           | mysql2 Connection Pool
                                           v
+-----------------------------------------------------------------------------------+
|                                 DATABASE TIER                                     |
|  MySQL Relational Database (luxehome)                                             |
|  ├── users (id, username, email, password_hash, role, created_at)                 |
|  ├── categories (id, name, slug, description, image_url)                          |
|  ├── services (id, category_id, title, description, full_description, price, ...) |
|  ├── bookings (id, user_id, service_id, service_title, user_email, status, ...)   |
|  └── login_logs (id, username, status, ip_address, login_time)                     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core Modules & Feature Breakdown

### A. Authentication & Role-Based Access Control (RBAC)
1. **Client Registration (`POST /api/signup`)**:
   - Public self-registration for new clients.
   - Enforces `role = 'client'` on the server side to eliminate any privilege escalation vulnerabilities.
   - Trims and normalizes inputs; hashes passwords with `bcryptjs` (10 rounds) before database storage.
2. **Client Login (`POST /api/login`)**:
   - Accepts either the client's **registered Email Address OR Username** + password.
   - Matches case-insensitively using `SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1`.
   - Validates using `await bcrypt.compare(inputPassword, user.password_hash)`.
   - Returns user profile including `role: 'client'`.
3. **Admin Login (`POST /api/login`)**:
   - Authenticates through the dedicated **Admin Login** portal.
   - Authenticates the pre-seeded admin account (`admin` / `admin@gmail.com`).
   - Validates `data.user.role === 'admin'`. Non-admin accounts attempting Admin Login are blocked with `"Access Denied: Only Admin accounts can log in here."`
   - Automatically routes admin users to the **Admin Dashboard** (`currentPage = 'admin'`).
4. **Route & Endpoint Protection**:
   - **Frontend**: In `App.jsx`, state-based route guards prevent clients and unauthenticated visitors from accessing the admin dashboard, automatically redirecting them to Home.
   - **Backend**: Protected administrative endpoints check `requireAdmin` middleware (`req.headers['x-user-role'] === 'admin'`) and return `403 Forbidden` for unauthorized requests.

### B. Client Experience & Booking Workflow
- **Category & Service Catalog Discovery**: Real-time browsing across service categories with detailed service descriptions, pricing, estimated duration, and high-resolution imagery.
- **Booking Flow**: Clients book services with a single click, recording `user_id`, `service_id`, `service_title`, and `user_email`.
- **My Bookings Dashboard**: Clients view their personal booking history with real-time status badges (Pending, Confirmed, In Progress, Completed, Cancelled) and cancellation actions.

### C. Comprehensive Admin Management Suite
- **System Overview & KPI Metrics**: Total Bookings, Registered Users, Active Services, Service Categories, recent bookings queue, and new user activity.
- **Bookings Management**: Real-time status modification dropdown (Pending -> Confirmed -> In Progress -> Completed -> Cancelled) and permanent deletion capability.
- **Services Catalog CRUD**: Add new services with full descriptions and image URLs, edit existing services in place, and delete obsolete services.
- **User Administration**: Promote / demote user roles between `client` and `admin`, inspect registration dates, and delete user accounts.

---

## 4. Relational Database Schema

| Table Name | Primary Columns & Types | Key Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| **`users`** | `id (INT PK AI)`, `username (VARCHAR 255)`, `email (VARCHAR 255)`, `password_hash (VARCHAR 255)`, `role (VARCHAR 50)`, `created_at (TIMESTAMP)` | `UNIQUE(username)`, `UNIQUE(email)`, `DEFAULT role='client'` | Stores authenticated accounts, roles, and bcrypt password hashes. |
| **`categories`** | `id (INT PK AI)`, `name (VARCHAR 255)`, `slug (VARCHAR 255)`, `description (TEXT)`, `image_url (VARCHAR 511)` | `UNIQUE(slug)` | Groups services into catalog domains. |
| **`services`** | `id (INT PK AI)`, `category_id (INT FK)`, `title (VARCHAR 255)`, `description (TEXT)`, `full_description (TEXT)`, `price (VARCHAR 50)`, `duration (VARCHAR 100)`, `image_url (VARCHAR 511)` | `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE` | Service offerings with detailed specifications and pricing. |
| **`bookings`** | `id (INT PK AI)`, `user_id (INT)`, `service_id (INT FK)`, `service_title (VARCHAR 255)`, `user_email (VARCHAR 255)`, `booking_date (TIMESTAMP)`, `status (VARCHAR 50)` | `FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL`, `DEFAULT status='Pending'` | Customer booking records and lifecycle states. |
| **`login_logs`** | `id (INT PK AI)`, `username (VARCHAR 255)`, `status (VARCHAR 50)`, `ip_address (VARCHAR 45)`, `login_time (TIMESTAMP)` | Audit Log Table | Security audit trail recording login attempts, success/failure, and client IP addresses. |

---

## 5. REST API Endpoints Reference

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/signup` | Public | Registers a new client with bcrypt password hashing (enforces `role = 'client'`). |
| **POST** | `/api/login` | Public | Authenticates credentials (Email/Username + Password) against bcrypt hash. |
| **GET** | `/api/categories` | Public / Client | Retrieves all service categories. |
| **GET** | `/api/services` | Public / Client | Retrieves all catalog services joined with category names. |
| **GET** | `/api/services/:slug` | Public / Client | Retrieves services filtered by category slug. |
| **POST** | `/api/bookings` | Client | Creates a new booking record for the logged-in client. |
| **GET** | `/api/bookings/user/:userId` | Client / Admin | Retrieves bookings belonging to a specific user. |
| **GET** | `/api/bookings` | Admin Only | Fetches all system-wide bookings for administrative management. |
| **PUT** | `/api/bookings/:id` | Admin Only | Updates a booking's status. |
| **DELETE** | `/api/bookings/:id` | Client / Admin | Cancels or deletes a booking. |
| **POST** | `/api/services` | Admin Only | Adds a new service to the catalog. |
| **PUT** | `/api/services/:id` | Admin Only | Updates service details, descriptions, prices, and images. |
| **DELETE** | `/api/services/:id` | Admin Only | Deletes a service from the database. |
| **GET** | `/api/users` | Admin Only | Retrieves all users with role and registration timestamps. |
| **PUT** | `/api/users/:id/role` | Admin Only | Updates a user's role (`client` / `admin`). |
| **DELETE** | `/api/users/:id` | Admin Only | Deletes a user account. |

---

## 6. High-Yield Technical Interview Questions & Answers

### Q1: Walk me through the architecture and data flow of LuxeHome.
> **Answer**: LuxeHome uses a decoupled 3-tier architecture. The frontend is built in React 19 (Vite) using dynamic state-driven navigation, glassmorphic UI components, and client-side route guards. When a user interacts with the app, HTTP requests are dispatched to an Express.js REST API server running on Node.js. The backend routes enforce authentication and authorization via custom middleware before querying a MySQL relational database managed through connection pooling (`mysql2`). Data is processed and returned as JSON.

### Q2: What authentication bug was diagnosed and how did you resolve it?
> **Answer**: 
> - **Issue**: Users who registered with an email and password could not log in with their email address. The backend query strictly checked `WHERE username = ? AND password_hash = ?`, and passwords were stored unhashed.
> - **Resolution**: 
>   1. Integrated `bcryptjs` with 10 salt rounds to hash all passwords during signup (`await bcrypt.hash(password, 10)`).
>   2. Updated `/api/login` with dual-identifier lookup: `SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1`.
>   3. Used `await bcrypt.compare(inputPassword, user.password_hash)` for secure verification with automatic fallback and migration for legacy seed users.

### Q3: How is Role-Based Access Control (RBAC) enforced between Client and Admin?
> **Answer**: RBAC is enforced across 3 distinct layers:
> 1. **Registration Layer**: `/api/signup` hardcodes `role = 'client'`, eliminating client-side privilege escalation.
> 2. **Backend Middleware**: The `requireAdmin` middleware inspects request headers (`x-user-role: 'admin'`) and blocks non-admin requests with `403 Forbidden` across all admin endpoints.
> 3. **Frontend Route Guards**: `App.jsx` evaluates `user.role`. Non-admin accounts attempting to open the Admin Dashboard or log in through Admin Login are rejected and redirected.

### Q4: How do you prevent SQL Injection and protect database integrity?
> **Answer**: 
> - **SQL Injection Prevention**: All queries use **parameterized statements** (e.g. `db.query('SELECT * FROM users WHERE email = ?', [email])`), separating SQL logic from user-supplied inputs.
> - **Integrity Constraints**: The database uses Foreign Keys with `ON DELETE CASCADE` (deleting a category removes associated services) and `ON DELETE SET NULL` (deleting a service preserves booking history while nullifying the reference).

### Q5: How would you scale this architecture for high-traffic enterprise deployment?
> **Answer**:
> 1. **JWT & Session Management**: Replace header-based role checking with signed JWT access tokens and secure HTTP-only refresh cookies.
> 2. **Caching**: Introduce a Redis cache layer for high-frequency, read-heavy catalog queries (services and categories).
> 3. **Payment Gateway Integration**: Integrate Stripe or PayPal webhooks for end-to-end payment capture.
> 4. **Real-Time Notifications**: Implement WebSockets via Socket.io for live booking status alerts.

---

## 7. Demo Accounts & Credentials Cheatsheet

- **Administrator Portal**:
  - **Username**: `admin`
  - **Email**: `admin@gmail.com`
  - **Password**: `1234`
  - **Access**: Select **Admin Login** tab on the login screen.
- **Client Account**:
  - **Username**: `testuser`
  - **Email**: `testuser@gmail.com`
  - **Password**: `password123`
  - **Or Register**: Click **Register** to create any new client account.
