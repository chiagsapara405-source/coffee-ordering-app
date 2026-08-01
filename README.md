# Caffeine ☕

A full-stack coffee ordering web app with a neumorphic UI. The frontend is built with **React 19, Vite, Tailwind CSS v4, and GSAP**; the backend is an **Express + MongoDB** API that runs both locally and as serverless functions on **Vercel**.

## Features

### Frontend

- **Landing page** – Hero section with drink cards, scroll reveals, and parallax effects (GSAP)
- **Auth system** – Login/signup with JWT-based persistence (`localStorage`)
- **Menu browsing** – Category filters, search bar, dietary tags and filter chips
- **Drink customization** – Size, milk, sugar level, espresso shots, syrup, temperature/ice with smart defaults per drink category
- **Order flow** – Add to cart with fly animation, mobile drawer, desktop sidebar
- **Cart management** – Quantity adjust, remove with undo toast, reorder last order
- **Confetti** – Burst animation on order confirmation
- **Dark mode** – CSS custom properties with `[data-theme="dark"]`
- **Loyalty program** – Buy 9 drinks, get 10th free (stamp card, tracked server-side)
- **Favorites** – Heart-toggle per menu item, synced to the user account
- **Pickup time** – ASAP / 15 min / 30 min / 1 hour selector
- **Admin dashboard** – Store stats, menu CRUD, order management, store settings
- **Accessibility** – Focus trap on modals, ARIA labels, keyboard navigation, `prefers-reduced-motion` support
- **Responsive** – Mobile-first with adaptive cart (drawer on mobile, panel on desktop)

### Backend

- **REST API** – Express 5 with JSON error handling and a health endpoint
- **Auth** – JWT (7-day tokens), bcrypt password hashing, rate-limited login/register, role-based access (`customer` / `admin`)
- **Server-side pricing** – Client-sent prices are ignored; unit price, line totals, tax, and total are computed on the server
- **Idempotent seeding** – Menu and admin user are upserted safely on every cold start (never overwrites admin edits)
- **Serverless-ready** – Cached Mongo connection + cached bootstrap so warm Vercel instances don't reconnect or reseed

## Tech Stack

| Frontend | Backend / Infra |
|---|---|
| React 19 | Node.js ≥ 20 |
| Vite 8 | Express 5 |
| Tailwind CSS 4 | Mongoose 9 (MongoDB Atlas) |
| GSAP 3.15 | jsonwebtoken + bcryptjs |
| React Router 7 | express-rate-limit |
| ESLint 10 | Vercel (serverless functions) |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (e.g. `mongodb+srv://<user>:<pass>@cluster.mongodb.net/caffeine`) |
| `JWT_SECRET` | Secret used to sign JWTs — generate with `openssl rand -hex 32` |
| `ADMIN_EMAIL` | Email of the seeded admin account (created on first start) |
| `ADMIN_PASSWORD` | Password of the seeded admin account |
| `CLIENT_ORIGIN` | Optional comma-separated list of extra CORS origins |
| `PORT` | Optional backend port (defaults to `5000`) |

### 3. Run locally

Run the backend (port 5000) and the frontend (port 5173) in two terminals:

```bash
# Terminal 1 — backend API
npm run server:dev

# Terminal 2 — frontend (Vite dev server proxies /api → localhost:5000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The admin dashboard is at [http://localhost:5173/admin](http://localhost:5173/admin) — sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite frontend dev server |
| `npm run server` | Start the Express backend |
| `npm run server:dev` | Start the backend with nodemon (auto-restart) |
| `npm run build` | Production build of the frontend |
| `npm run preview` | Preview the production frontend build |
| `npm run lint` | Run ESLint |

## Frontend Routes

| Path | Page | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/login` | Login / Sign up | Public |
| `/menu` | Ordering app | Requires login |
| `/admin` | Admin dashboard | Requires admin role |

## API Reference

Base URL: `/api` (proxied to `localhost:5000` in dev, same-origin on Vercel).

All protected endpoints require `Authorization: Bearer <token>`.

### Health

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Liveness check → `{ "status": "ok", "timestamp": ... }` |

### Auth (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account (rate-limited, 15 req / 15 min) |
| POST | `/login` | Public | Sign in (rate-limited) |
| GET | `/me` | User | Current user (id, name, email, role, stamps, favorites) |
| PUT | `/me/favorites` | User | Replace favorites list (array of item ids) |
| GET | `/admin/stats` | Admin | User counts (customers + admins) |

### Menu (`/api/menu`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Available menu items |
| GET | `/all` | Admin | All items, including unavailable (newest first) |
| POST | `/` | Admin | Create a menu item |
| PUT | `/:id` | Admin | Update by Mongo `_id` or `itemId` |
| DELETE | `/:id` | Admin | Delete by Mongo `_id` or `itemId` |

### Orders (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | User | Place order — prices computed server-side; returns order + loyalty stamps |
| GET | `/my` | User | Paginated own orders (`?page=` & `?limit=`) |
| GET | `/` | Admin | Paginated all orders (`?page=` & `?limit=`) |
| PUT | `/:id/status` | Admin | Update status (`pending`, `preparing`, `ready`, `completed`, `cancelled`) |

### Settings (`/api/settings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Store settings (name, hours, tax rate, currency) |
| PUT | `/` | Admin | Update store settings |

## Project Structure

```
├── api/
│   └── index.js          # Vercel serverless handler (bootstraps then serves the app)
├── server/
│   ├── app.js            # Express app setup (routes, CORS, error handlers)
│   ├── bootstrap.js      # Cached DB connect + seed bootstrap (serverless-safe)
│   ├── server.js         # Local dev entry (env validation + listen)
│   ├── config/
│   │   ├── db.js         # Cached MongoDB connection (globalThis cache)
│   │   └── options.js    # Drink options & price calculation
│   ├── middleware/
│   │   ├── auth.js       # JWT protect + adminOnly guards
│   │   └── errorHandler.js
│   ├── models/           # Mongoose models (User, MenuItem, Order, StoreSettings)
│   ├── routes/           # Express routers (auth, menu, orders, settings)
│   └── seed.js           # Idempotent menu + admin seeding
├── src/
│   ├── api/client.js     # Fetch wrapper with JWT headers + safe errors
│   ├── components/       # React components (incl. admin/ dashboard)
│   ├── data/             # Menu data, auth helpers, settings
│   ├── hooks/            # useLocalStorage, useFocusTrap
│   ├── pages/            # LandingPage, LoginPage, AdminPage
│   ├── App.jsx           # Main ordering app
│   ├── main.jsx          # Entry point with router
│   └── index.css         # Global styles, CSS variables, themes
├── .env.example          # Environment variable template
└── vercel.json           # Serverless routing (API + SPA fallback)
```

## Deployment (Vercel)

The app is deployed as a **static frontend + serverless API** in a single Vercel project. `api/index.js` is the serverless entry; `vercel.json` routes `/api/*` to it and everything else to `index.html` (preserving client-side routing).

### Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for **both Preview and Production** (use separate databases per environment to avoid polluting live data with preview test data):

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLIENT_ORIGIN` (optional)

### Notes

- **MongoDB Atlas:** allow access from anywhere (`0.0.0.0/0`) under **Network Access** — Vercel functions use dynamic IPs.
- **Cold starts:** the function may take a few seconds on the first request (allowed `maxDuration` is 60s). Bootstrap is cached per warm instance.
- **Admin seeding:** the admin is created only if it doesn't exist; changing `ADMIN_PASSWORD` later won't rotate an existing admin's password.
- **CORS:** localhost, `*.vercel.app` preview domains, and `CLIENT_ORIGIN` are allowed by default.

## Design

- **Colors**: Warm coffee tones (beige, brown, cream)
- **Typography**: Playfair Display (serif), Space Grotesk (sans), Space Mono (mono)
- **UI**: Neumorphic cards, soft shadows, pill-shaped buttons
