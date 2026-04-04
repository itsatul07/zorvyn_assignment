# Finance Data Processing and Access Control Backend

A RESTful backend API for a finance dashboard system built with Node.js, Express, and MongoDB. It supports role-based access control, financial transaction management, and summary-level dashboard analytics.

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express v5
- **Database:** MongoDB via Mongoose
- **Authentication:** JWT stored in HTTP-only cookies
- **Password Hashing:** bcrypt
- **Dev Tool:** nodemon

---

## Project Structure

```
zorvyn_assignment/
├── connection/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── AdminController.js       # Admin user management logic
│   ├── DashboardController.js   # Role-aware dashboard aggregations
│   ├── ProfileController.js     # User profile endpoints
│   ├── TransactionController.js # Full CRUD for transactions
│   └── UserController.js        # Auth — register, login, logout
├── middlewares/
│   ├── auth.js                  # JWT verification + role authorization
│   └── transactionValidation.js # Transaction ownership guard
├── models/
│   ├── TransactionModel.js      # Transaction schema + DB indexes
│   └── UserModels.js            # User schema with bcrypt hooks
├── routes/
│   ├── AdminRouter.js           # Admin-only management routes
│   ├── DashboardRouter.js       # Dashboard summary route
│   ├── TransactionRouter.js     # Transaction CRUD routes
│   └── UserRouter.js            # Auth + profile + user listing
├── seed.js                      # Faker-based seed script
├── app.js                       # Express app + middleware setup
└── index.js                     # Server entry point
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- A MongoDB connection URI (MongoDB Atlas or local)

### Installation

```bash
# Extract the project folder
cd zorvyn_assignment

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Run the Server

```bash
npm start
```

The server starts on `http://localhost:3000`.

### Seed Dummy Data (Optional)

Populates the database with 10 users and 100 transactions for testing:

```bash
node seed.js
```

> ⚠️ This will **wipe all existing data** before inserting. Use only in development.

---

## Roles and Permissions

| Action                              | Viewer | Analyst | Admin |
|-------------------------------------|--------|---------|-------|
| Login / Logout                      | ✅     | ✅      | ✅    |
| View own profile (`/me`)            | ✅     | ✅      | ✅    |
| View dashboard summary              | ✅     | ✅      | ✅    |
| View all transactions (list)        | ❌     | ✅      | ✅    |
| View all users                      | ❌     | ✅      | ✅    |
| View another user's profile         | ❌     | ✅      | ✅    |
| View transactions by user ID        | ❌     | ✅      | ✅    |
| View a transaction by ID            | ❌     | ✅      | ✅    |
| Create a transaction                | ❌     | ✅      | ✅    |
| Update own transaction              | ❌     | ✅      | ✅    |
| Update any transaction              | ❌     | ❌      | ✅    |
| Delete own transaction              | ❌     | ✅      | ✅    |
| Delete any transaction              | ❌     | ❌      | ✅    |
| Create users (admin panel)          | ❌     | ❌      | ✅    |
| Change user roles                   | ❌     | ❌      | ✅    |
| Delete a user                       | ❌     | ❌      | ✅    |

**Viewer dashboard** returns global aggregates across all users.  
**Analyst / Admin dashboard** returns data scoped to that user's own transactions.

---

## API Endpoints

### Auth & Users — `/api/users`

| Method | Endpoint    | Auth Required          | Description                          |
|--------|-------------|------------------------|--------------------------------------|
| POST   | `/signup`   | No                     | Register a new user                  |
| POST   | `/login`    | No                     | Login and receive a JWT cookie       |
| POST   | `/logout`   | Yes (any role)         | Clear the auth cookie                |
| GET    | `/me`       | Yes (any role)         | Get the logged-in user's profile     |
| GET    | `/`         | Yes (analyst, admin)   | List all users                       |
| GET    | `/:id`      | Yes (analyst, admin)   | View another user's profile by ID    |

---

### Transactions — `/api/transactions`

| Method | Endpoint          | Auth Required          | Description                                        |
|--------|-------------------|------------------------|----------------------------------------------------|
| POST   | `/`               | Yes (analyst, admin)   | Create a new transaction                           |
| GET    | `/`               | Yes (any role)         | List all transactions (filterable + paginated)     |
| GET    | `/:id`            | Yes (analyst, admin)   | Get a single transaction by ID                     |
| PUT    | `/:id`            | Yes (analyst, admin)   | Update a transaction (own only, or admin for any)  |
| DELETE | `/:id`            | Yes (analyst, admin)   | Delete a transaction (own only, or admin for any)  |
| GET    | `/user/:userId`   | Yes (analyst, admin)   | Get all transactions belonging to a specific user  |

**Query Parameters for `GET /api/transactions`:**

| Param      | Type   | Description                                      |
|------------|--------|--------------------------------------------------|
| `type`     | String | Filter by `income` or `expense`                  |
| `category` | String | Filter by `food`, `rent`, `salary`, etc.         |
| `sortBy`   | String | Sort results by `date` or `amount` (descending)  |
| `page`     | Number | Page number for pagination (default: `1`)        |
| `limit`    | Number | Results per page (default: `10`)                 |

---

### Dashboard — `/api/dashboard`

| Method | Endpoint | Auth Required  | Description                     |
|--------|----------|----------------|---------------------------------|
| GET    | `/`      | Yes (any role) | Returns role-aware summary data |

**Viewer response includes:**
- `summary` — global income, expense, net balance across all users
- `recentTransactions` — latest 5 transactions globally with user info populated
- `monthlyTrends` — month-by-month income vs expense breakdown globally

**Analyst / Admin response includes:**
- `summary` — income, expense, net balance scoped to the requesting user's own transactions
- `categories` — spending totals grouped by category (own transactions only)
- `recentTransactions` — latest 5 of their own transactions
- `monthlyTrends` — monthly totals of their own transactions

---

### Admin — `/api/admin`

| Method | Endpoint      | Auth Required  | Description                                 |
|--------|---------------|----------------|---------------------------------------------|
| POST   | `/user`       | Yes (admin)    | Create a new user                           |
| PUT    | `/user`       | Yes (admin)    | Change the role of an existing user         |
| DELETE | `/users/:id`  | Yes (admin)    | Delete a user and cascade-delete their data |

---

## Data Models

### User

| Field      | Type    | Notes                                                |
|------------|---------|------------------------------------------------------|
| `name`     | String  | Required                                             |
| `email`    | String  | Required, unique, auto-lowercased                    |
| `password` | String  | Hashed with bcrypt automatically on save             |
| `role`     | String  | `viewer`, `analyst`, or `admin` (default: `analyst`) |
| `isActive` | Boolean | Inactive users are blocked from logging in           |

### Transaction

| Field       | Type     | Notes                                                   |
|-------------|----------|---------------------------------------------------------|
| `amount`    | Number   | Required                                                |
| `type`      | String   | `income` or `expense` — required                        |
| `category`  | String   | `food`, `rent`, `salary`, `shopping`, `travel`, `other` |
| `date`      | Date     | Represents the real-world event date, defaults to now   |
| `note`      | String   | Optional free-text description                          |
| `createdBy` | ObjectId | Reference to the User who created this record           |

Database indexes are applied on `date`, `category`, `type`, and `createdBy` for efficient filtering and sorting.

---

## Authentication

All protected routes require a valid JWT token, issued on login and stored in an **HTTP-only cookie** named `token`.

- Token expires after **7 days**
- Token is cleared on logout via `res.clearCookie`
- HTTP-only cookies are not accessible via JavaScript, which prevents XSS-based token theft

---

## Middleware

### `isAuthenticated`
Reads the JWT from the request cookie, verifies it against `JWT_SECRET`, and attaches the decoded `{ id, role }` payload to `req.user`. Returns `401` if no token is present.

### `authorizeRoles(...roles)`
A higher-order middleware factory. After authentication, checks that `req.user.role` is in the allowed list. Returns `403` if not.

### `isTransactionOwner`
Applied to `PUT` and `DELETE` transaction routes. Fetches the transaction by ID and verifies the requesting user either owns it or is an admin. Attaches the transaction to `req.transaction` for downstream reuse. Returns `403` if unauthorized, `404` if not found.

---

## Assumptions Made

- Public registration (`/signup`) defaults new users to the `analyst` role unless a `role` is explicitly provided. Admins can assign a different role at creation time via `/api/admin/user`.
- Viewers are only limited to see the dashboard data and their profile data nothing else.
- The dashboard endpoint (`GET /api/dashboard`) serves different response shapes depending on the requesting user's role — no separate endpoints are needed.
- Deleting a user via `DELETE /api/admin/users/:id` cascades and also deletes all transactions created by that user.
- The `date` field on a transaction represents the real-world date of the financial event. The `createdAt` field is the Mongoose-managed record creation timestamp. Monthly trend aggregations use `createdAt`.
- Analysts can list all users and view any user's profile to support team-level workflows. Sensitive fields like passwords are always excluded via `.select("-password")`.
- Admin/Analyst can see the whole transactions based on query based filtering via parameters in url only
---

## Testing
- All API endpoints have been thoroughly tested using Postman, ensuring proper validation, expected responses, and error handling across different scenarios.
-  Dummy data used during testing was generated with the `faker` npm package.
