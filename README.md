# GoRent

GoRent is a full-stack vehicle rental platform built with React, Node.js/Express, and MongoDB. It supports customer bookings, map-based pickup selection, payment workflows (including admin verification), post-ride feedback, realtime admin/user updates, and role-based access with JWT.

## Overview

GoRent provides:
- Customer authentication, vehicle browsing, booking, and payment flows
- Admin dashboard for booking/vehicle/user/payment management
- Location-aware UX (nearby vehicle finder + map-based pickup)
- Realtime updates between user and admin via Socket.IO
- Analytics dashboard with KPI cards and graph-style visualizations

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- React DatePicker
- Leaflet + React Leaflet
- Socket.IO Client
- CSS (custom design tokens and utility classes)

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs
- multer (vehicle media uploads)
- Socket.IO

## Monorepo Structure

```text
GoRent/
├── gorent-backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── gorent-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
├── Guide.md
└── README.md
```

## Core Features

### Customer
- Register/login with JWT
- Browse and filter vehicles
- Find top nearby vehicles from current location (Home screen)
- Open vehicle details + map modal and book directly
- Pickup location auto-filled from current location (editable)
- Payment flow after ride completion:
  - eSewa / Khalti / Mobile Banking
  - Cash (submitted by user, verified by admin)
- Post-completion feedback (after payment confirmation)

### Admin
- Manage vehicles (create/update/delete/availability)
- Set pickup locations via manual input or map picker
- Manage booking statuses (confirm/complete/cancel)
- Verify pending payments from bookings table
- View payment method + status per booking
- Blacklist/unblock users
- Analytics tab with:
  - bookings/revenue KPIs
  - booking status distribution
  - payment method share
  - revenue trend (last 6 months)
  - vehicles by category
  - top-rated vehicles

### System
- Route protection for authenticated/admin areas
- Nominatim proxy endpoints for geocoding/reverse geocoding
- Realtime socket events for booking/payment lifecycle
- Toasts, confirm dialogs, responsive UI, theme support

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)

## Environment Variables

### Backend: `gorent-backend/.env`

```env
MONGO_URI=mongodb://localhost:27017/gorent
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ADMIN_SECRET=gorent-admin-reset
```

### Frontend: `gorent-frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Installation

```bash
# backend
cd gorent-backend
npm install

# frontend
cd ../gorent-frontend
npm install
```

## Run Locally

```bash
# terminal 1 (backend)
cd gorent-backend
npm run dev

# terminal 2 (frontend)
cd gorent-frontend
npm start
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Scripts

### Backend (`gorent-backend/package.json`)
- `npm run dev` - start backend with nodemon
- `npm start` - start backend with node

### Frontend (`gorent-frontend/package.json`)
- `npm start` - run development server
- `npm run build` - create production build
- `npm test` - run tests

## API Summary

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/me`
- `PUT /auth/admin-profile`
- `GET /auth/users` (admin)
- `PUT /auth/users/:id/blacklist` (admin)
- `PUT /auth/users/:id/unblacklist` (admin)

### Vehicles
- `GET /vehicles`
- `GET /vehicles/locations`
- `GET /vehicles/:id`
- `POST /vehicles` (admin)
- `PUT /vehicles/:id` (admin)
- `DELETE /vehicles/:id` (admin)

### Bookings
- `POST /bookings`
- `GET /bookings`
- `GET /bookings/all` (admin)
- `PUT /bookings/:id/status` (admin)
- `PUT /bookings/:id/cancel`
- `PUT /bookings/:id/payment`
- `PUT /bookings/:id/payment/verify` (admin)
- `DELETE /bookings/:id` (admin)

### Feedback
- `POST /feedback`
- `PUT /feedback/skip/:bookingId`
- `GET /feedback/summary` (admin)

### Location Proxy (Nominatim)
- `GET /location/search?q=...`
- `GET /location/reverse?lat=...&lon=...`

### Health
- `GET /health`

## Realtime Events (Socket.IO)

Examples of emitted events:
- `booking:created`
- `booking:status_updated`
- `booking:cancelled`
- `booking:payment_submitted`
- `booking:payment_verified`
- `booking:deleted`
- `system:api_request` (admin monitoring)
- `system:api_response` (admin + requesting user)

## Default Admin Account

On first successful backend startup, default admin is created:

- Email: `admin@gorent.com`
- Password: `admin123`

## Security Notes

- JWT is required for protected endpoints.
- Admin-only routes validate role from token payload.
- Blacklisted users are blocked from creating bookings.
- Sensitive values should be provided via `.env` files.

## Troubleshooting

### MongoDB not connecting
- Confirm `MONGO_URI` is valid.
- Ensure MongoDB service/cluster is reachable.

### CORS errors
- Add frontend origin to `ALLOWED_ORIGINS`.

### Payment verify not visible in admin
- Booking must be completed and unpaid.

### Realtime not updating
- Ensure both backend and frontend are restarted after dependency changes.
- Check that token exists in localStorage (socket auth depends on JWT).

### Build warnings
- Current frontend has non-blocking lint warnings; app still builds and runs.

## License

This project is intended for educational and internal development use unless otherwise specified.
