# Cartly — Full-Stack E-Commerce Store

A complete e-commerce store built with **Node.js, Express, MongoDB/Mongoose** on the backend and **vanilla HTML/CSS/JavaScript** on the frontend (served by the same Express server — no build step required).

## Features

- **Authentication** — register/login with hashed passwords (bcrypt) and JWT-based sessions, protected routes, logout.
- **Product catalog** — search, category filters, sorting, pagination, product detail pages with a stock-level indicator.
- **Cart** — add/remove/update quantity, persisted in MongoDB per user, live subtotal/total.
- **Checkout** — delivery details form with validation, order summary, generates a unique order ID.
- **Orders** — status lifecycle (`Pending → Processing → Shipped → Delivered`), visible to the customer on their dashboard.
- **User dashboard** — profile info, order history, spending stats.
- **Admin panel** — add/edit/delete products, view all users, view all orders, update order status, store-wide stats.

## Tech Stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript (Fetch API)   |
| Backend   | Node.js, Express.js                           |
| Database  | MongoDB with Mongoose                         |
| Auth      | JWT + bcryptjs                                |

## Project Structure

```
ecommerce-store/
├── server.js               # App entry point
├── config/db.js            # MongoDB connection
├── models/                 # Mongoose schemas (User, Product, Cart, Order)
├── middleware/auth.js      # JWT auth + admin guard
├── controllers/            # Route handler logic
├── routes/                 # Express route definitions
├── seed/seedProducts.js    # Sample data + admin account seeder
├── public/                 # Frontend (served statically by Express)
│   ├── index.html           # Product listing
│   ├── product.html         # Product details
│   ├── cart.html            # Shopping cart
│   ├── checkout.html        # Checkout / place order
│   ├── login.html / register.html
│   ├── dashboard.html       # Customer profile + order history
│   ├── admin.html           # Admin panel
│   ├── css/style.css
│   └── js/                  # api.js, auth.js, cart.js, admin.js, etc.
└── .env.example
```

## Getting Started

### 1. Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```
At minimum, set `MONGO_URI` and `JWT_SECRET`.

### 4. Seed the database (sample products + admin account)
```bash
npm run seed
```
This creates 18 sample products across 6 categories and an admin account using the credentials from your `.env` (defaults to `admin@store.com` / `Admin@12345`).

To wipe products later: `npm run seed:destroy`

### 5. Run the server
```bash
npm start        # production
npm run dev      # with nodemon auto-reload (requires devDependencies installed)
```

The app will be available at **http://localhost:5000** (or whatever `PORT` you set). The frontend and API are served from the same origin, so there's nothing else to configure.

### 6. Try it out
- Visit the homepage, search/filter products, add items to your cart.
- Register a new account (or log in as admin using the seeded credentials) to check out and view orders.
- Log in as admin (`admin@store.com` / `Admin@12345` by default) and open **Admin** in the nav to manage products, view users, and update order statuses.

## API Overview

All endpoints are prefixed with `/api`.

| Method | Endpoint                        | Access        | Description                        |
|--------|----------------------------------|---------------|-------------------------------------|
| POST   | `/auth/register`                | Public        | Create an account                   |
| POST   | `/auth/login`                   | Public        | Log in, returns JWT                 |
| GET    | `/auth/profile`                 | Private       | Get current user profile            |
| GET    | `/products`                     | Public        | List products (search/filter/sort)  |
| GET    | `/products/categories`          | Public        | Distinct category list              |
| GET    | `/products/:id`                 | Public        | Product detail                      |
| POST   | `/products`                     | Admin         | Create product                      |
| PUT    | `/products/:id`                 | Admin         | Update product                      |
| DELETE | `/products/:id`                 | Admin         | Delete product                      |
| GET    | `/cart`                         | Private       | Get current user's cart             |
| POST   | `/cart`                         | Private       | Add item to cart                    |
| PUT    | `/cart/:productId`              | Private       | Update item quantity                |
| DELETE | `/cart/:productId`              | Private       | Remove item                         |
| DELETE | `/cart`                         | Private       | Empty cart                          |
| POST   | `/orders`                       | Private       | Place order from cart               |
| GET    | `/orders`                       | Private       | List current user's orders          |
| GET    | `/orders/:id`                   | Private       | Get single order (owner or admin)   |
| GET    | `/admin/users`                  | Admin         | List all users                      |
| GET    | `/admin/orders`                 | Admin         | List all orders                     |
| PUT    | `/admin/orders/:id/status`      | Admin         | Update an order's status            |
| GET    | `/admin/stats`                  | Admin         | Dashboard summary stats             |

## Notes

- Passwords are hashed with bcrypt before storage; plaintext passwords are never persisted or returned by the API.
- JWTs are stored in `localStorage` on the client and sent as a `Bearer` token on every request that needs auth.
- Stock is decremented automatically when an order is placed, and cart quantities are validated against live stock.
- This is a learning/demo project — for production use you'd want to add things like HTTPS, refresh tokens, rate limiting, and a real payment gateway integration.
