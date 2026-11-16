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


