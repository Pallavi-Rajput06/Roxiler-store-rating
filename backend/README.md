# Roxiler Store Rating System - Backend API

Node.js, Express.js, and MySQL backend for the Roxiler Systems Full Stack Intern Coding Assessment.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Supports three distinct roles (`SYSTEM_ADMIN`, `NORMAL_USER`, `STORE_OWNER`).
- **Authentication**: Secure JWT authentication and bcrypt password hashing.
- **Form Validations**: Enforces strict assessment validation rules for Name (20–60 chars), Password (8–16 chars with uppercase & special character), Address (max 400 chars), and Email.
- **Database Normalization**: Optimized MySQL schema with primary keys, foreign keys, indexes, and `UNIQUE(user_id, store_id)` constraint to guarantee a user can submit only one rating per store while allowing later modifications.
- **Admin Dashboard**: System statistics (total users, stores, ratings), user management, store management, and user details (with store owner rating display).
- **Store Owner Dashboard**: Store average rating breakdown and detailed list of users who submitted ratings for their store.
- **Normal User Capabilities**: Store discovery with search (by Name/Address), filtering, sorting, store overall rating aggregation, rating submission, and rating modification.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (`mysql2/promise` connection pool)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Security**: Password hashing with `bcryptjs`
- **Validation**: `express-validator`
- **CORS**: Enabled (`cors`)
- **Environment**: `dotenv`

---

## 📁 Project Structure

```
backend/
├── database/
│   ├── schema.sql         # Database structure, tables, constraints, indexes
│   ├── seed.sql           # SQL seed script
│   ├── seed.js            # Node script for dynamic bcrypt password hashing
│   └── setup.js           # Full setup script (creates schema + seeds data)
├── src/
│   ├── config/
│   │   └── db.js          # MySQL connection pool configuration
│   ├── controllers/
│   │   ├── adminController.js # Admin dashboard, user & store management
│   │   ├── authController.js  # Signup, Login, Password management, Profile
│   │   ├── ratingController.js# Submit and modify store ratings
│   │   └── storeController.js # User store listing, search, store owner dashboard
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication middleware
│   │   ├── role.js        # Role-based authorization middleware
│   │   └── validate.js    # Input validation error handler middleware
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── storeOwnerRoutes.js
│   │   └── storeRoutes.js
│   ├── utils/
│   │   ├── responseHandler.js # Standardized JSON responses
│   │   └── validators.js      # Input validation schema definitions
│   ├── app.js             # Express application setup
│   └── server.js          # Server entry point
├── .env.example
├── package.json
├── test-api.js            # Automated E2E verification test suite
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MySQL Server](https://www.mysql.com/) (v8.0+ running locally or remotely)

### 2. Environment Variables Configuration
Copy `.env.example` to `.env` and fill in your MySQL credentials:

```bash
cp .env.example .env
```

`.env` Configuration:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YourMySQLPassword
DB_NAME=store_rating_db
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Initialization & Seeding
Run the automated database setup command to create the database schema, tables, foreign key constraints, indexes, and compliant seed data:

```bash
npm run db:setup
```

---

## 🏃 Running the Backend Server

### Development Mode (with Nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:5000`.

---

## 🧪 Automated Testing

To run the comprehensive end-to-end automated test suite verifying all routes, authorization rules, rating modifications, and validation constraints:

```bash
node test-api.js
```

---

## 🔑 Test Credentials
These are demo credentials for the seeded local development database.

The database comes pre-seeded with test accounts compliant with form validation rules (Name: 20-60 chars, Password: 8-16 chars with uppercase & special char):

| Role | Email | Password | Name |
|---|---|---|---|
| **System Administrator** | `admin@roxiler.com` | `AdminPass@123` | System Administrator Account |
| **Store Owner** | `owner@roxiler.com` | `OwnerPass@123` | Store Owner Manager User |
| **Normal User 1** | `user1@roxiler.com` | `UserPass@1234` | Johnathan Doe Sample User |
| **Normal User 2** | `user2@roxiler.com` | `UserPass@5678` | Alice Smith Reviewer One |

---

## 🌐 API Endpoint Summary

### 🔑 Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new normal user |
| `POST` | `/api/auth/login` | Public | Log in for all roles (Returns JWT token) |
| `POST` | `/api/auth/logout` | Public | Log out client session |
| `PUT` | `/api/auth/change-password` | Authenticated | Update user password |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### 👑 System Administrator Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | `SYSTEM_ADMIN` | View dashboard totals (Users, Stores, Ratings) |
| `POST` | `/api/admin/users` | `SYSTEM_ADMIN` | Create user (Admin, Normal User, Store Owner) |
| `POST` | `/api/admin/stores` | `SYSTEM_ADMIN` | Add a new store (Assign store owner) |
| `GET` | `/api/admin/users` | `SYSTEM_ADMIN` | List/filter/sort all users |
| `GET` | `/api/admin/users/:id` | `SYSTEM_ADMIN` | View user details (Includes Store Owner's store rating) |
| `GET` | `/api/admin/stores` | `SYSTEM_ADMIN` | List/filter/sort all stores with average ratings |

### 🏪 Store & Rating Routes (`/api/stores`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stores` | Public / User | List registered stores with search (Name/Address), sorting, overall rating, and user submitted rating |
| `POST` | `/api/stores/:id/rating` | `NORMAL_USER` | Submit rating (1 to 5) for a store |
| `PUT` | `/api/stores/:id/rating` | `NORMAL_USER` | Modify submitted rating for a store |

### 🏬 Store Owner Routes (`/api/store-owner`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/store-owner/dashboard` | `STORE_OWNER` | View store average rating & list of users who rated their store |

---

## 📋 Form Validation Rules

- **Name**: 20 – 60 characters.
- **Address**: Maximum 400 characters.
- **Password**: 8 – 16 characters, containing at least 1 uppercase letter (`[A-Z]`) and 1 special character (`[!@#$%^&*(),.?":{}|<>]`).
- **Email**: Standard RFC email format.
- **Rating**: Integer between 1 and 5.
