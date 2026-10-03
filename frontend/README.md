# Roxiler Store Rating System - React Frontend

Modern, responsive React.js frontend built with Vite, React Router v6, Axios, and Lucide Icons for the Roxiler Systems Full Stack Intern Coding Assessment.

## 🌟 Features

- **Role-Based Routing & Dashboards**:
  - **System Administrator (`SYSTEM_ADMIN`)**: Dashboard analytics (Users, Stores, Ratings), User Management (add user, role filter, sorting, view user details with Store Owner rating), Store Management (add store, owner assignment, sorting).
  - **Normal User (`NORMAL_USER`)**: Account signup, store discovery grid, real-time search by Store Name & Address, sorting, overall rating visualization, 1-5 star rating submission & modification.
  - **Store Owner (`STORE_OWNER`)**: Store overview dashboard, overall average rating breakdown, and table of customers who submitted ratings for their store.
- **Form Validations**: Strictly enforces inline validation rules near form inputs (Name 20–60 chars, Password 8–16 chars with uppercase & special char, Address max 400 chars, Email format, Rating 1–5).
- **Authentication & Security**: Global `AuthContext` with JWT token persistence in `localStorage`, automatic request header interception via Axios, auto session restoration via `/api/auth/me`, and strict route guards preventing unauthorized URL entry.
- **Modern Design System**: Custom dark-slate theme with glassmorphic cards, gradient accents, role badges, interactive star ratings, toast notification banners, and responsive layouts.

---

## 🛠️ Tech Stack

- **Framework**: React 18 (Vite)
- **Routing**: React Router v6 (`react-router-dom`)
- **HTTP Client**: Axios (`axios`)
- **Icons**: Lucide Icons (`lucide-react`)
- **Styling**: Custom CSS design system with CSS Variables & Glassmorphism

---

## ⚙️ Setup & Installation

### 1. Environment Configuration
Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`.

---

## 🔑 Test Accounts for Verification

| Role | Email | Password | Name |
|---|---|---|---|
| **System Administrator** | `admin@roxiler.com` | `AdminPass@123` | System Administrator Account |
| **Store Owner** | `owner@roxiler.com` | `OwnerPass@123` | Store Owner Manager User |
| **Normal User 1** | `user1@roxiler.com` | `UserPass@1234` | Johnathan Doe Sample User |
| **Normal User 2** | `user2@roxiler.com` | `UserPass@5678` | Alice Smith Reviewer One |

*(Note: The login page includes quick demo buttons for autofilling these credentials instantly!)*

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── api.js             # Axios instance & JWT interceptors
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state & session restoration
│   ├── components/
│   │   ├── Navbar.jsx         # Header navigation bar
│   │   ├── Sidebar.jsx        # Admin navigation sidebar
│   │   ├── ProtectedRoute.jsx # Auth & Role route guards
│   │   ├── StarRating.jsx     # Interactive 1-5 star rating component
│   │   ├── Modal.jsx          # Reusable pop-up modal
│   │   ├── Toast.jsx          # Success & error message banner
│   │   ├── Loader.jsx         # Loading indicator
│   │   └── UserDetailsModal.jsx # Admin view user details modal
│   ├── pages/
│   │   ├── Login.jsx          # Unified login page
│   │   ├── Signup.jsx         # Normal user registration page
│   │   ├── ChangePassword.jsx # Update password page
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx # System stats dashboard
│   │   │   ├── UsersManagement.jsx # Add user, filter, sort, view details
│   │   │   └── StoresManagement.jsx # Add store, owner assign, sort
│   │   ├── user/
│   │   │   └── UserStores.jsx     # Store search, overall rating, submit/modify rating
│   │   └── owner/
│   │       └── OwnerDashboard.jsx # Store avg rating & customer ratings table
│   ├── styles/
│   │   └── index.css          # Design system & styles
│   ├── App.jsx                # Router configuration & layouts
│   └── main.jsx               # Entry point
├── .env.example
├── .env
├── package.json
└── README.md
```
