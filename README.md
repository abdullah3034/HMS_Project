## HMS NEXTGENCODERS — Hotel Management System (Monorepo)

A full‑stack Hotel Management System built with a React + Vite frontend and a Node.js/Express + MongoDB backend.

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, React Router, React Hook Form, TanStack Query, Recharts, Stripe.js
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT, Multer, Stripe, Nodemailer

### Repository Layout
```
HMS_Project/
  HMS_NEXTGENCODERS-frondend/   # React + Vite client
  HMS-NEXTGENCODERS-backend/    # Node.js + Express API
```

## Quick Start

Prerequisites:
- Node.js 18+ and npm
- MongoDB instance (local or hosted)

### 1) Backend setup
```
cd HMS-NEXTGENCODERS-backend
npm install
```

Create a `.env` file in `HMS-NEXTGENCODERS-backend`:
```env
# Server
PORT=8000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/hms

# Auth
JWT_SECRET=change_me_to_a_long_random_string

# Email (if using nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="HMS <noreply@example.com>"

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Run the server (nodemon recommended during development):
```
npm run dev
```

By default the API will start on `http://localhost:8000`.

### 2) Frontend setup
```
cd HMS_NEXTGENCODERS-frondend
npm install --legacy-peer-deps
```

Start the client:
```
npm run dev
```

Vite serves the app on `http://localhost:5173` by default. The backend CORS is already configured for `http://localhost:5173` (and `http://localhost:5175`).

## Configuration

### CORS
The backend enables CORS for these origins (see `server.js`):
```
http://localhost:5173
http://localhost:5175
```
If your frontend runs elsewhere, add its origin to the array in `server.js` under `cors({ origin: [...] })`.

### Static uploads
File uploads are served from `/uploads`. Ensure the `uploads/` directory exists and is writable.

## Scripts

### Backend (`HMS-NEXTGENCODERS-backend/package.json`)
- `npm run start` — start server with Node
- `npm run dev` — start server with Nodemon

### Frontend (`HMS_NEXTGENCODERS-frondend/package.json`)
- `npm run dev` — start Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build

## API Overview (high level)

Base URL: `http://localhost:8000`

Mounted routes (see `server.js`):
- `/api/auth`, `/api/user`, `/api/cart`
- `/api/rooms` (admin), `/api/reception`, `/api/settings`, `/api/sales`, `/api/transactions`, `/api/stocks`, `/api/checkouts`
- `/api/hotel-rooms`, `/api/reservations`, `/api/guests`, `/api/packages`, `/api/daily-data`, `/api/process-payment`
- `/categories`, `/products`, `/orders`

## Troubleshooting
- **Peer dependency issues (frontend)**: use the exact install used here: `npm install --legacy-peer-deps`.
- **CORS errors**: confirm the frontend origin is allowed in backend `cors` config.
- **MongoDB connection**: verify `MONGO_URI` in `.env` and that MongoDB is running/reachable.
- **JWT errors**: ensure `JWT_SECRET` is set and consistent across sessions.
- **Stripe webhooks**: set `STRIPE_WEBHOOK_SECRET` and use `stripe listen` during local development.

## Development Notes
- Backend default port is `8000` (configurable via `PORT`).
- Frontend default port is `5173`.
- Adjust environment variables according to your local/cloud setup.

---

Happy building! If you run into issues, open an issue or check logs in the backend terminal for helpful messages (Mongo/Stripe/Nodemailer errors are logged on startup/usage).