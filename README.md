# GoRent - Vehicle Rental Platform

A full-stack MERN (MongoDB, Express, React, Node.js) application for vehicle rental management.

## Features

- User registration and authentication
- Browse available vehicles
- Book vehicles for specific dates
- Admin dashboard for managing vehicles and bookings
- Image upload support via ImageKit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- ImageKit for image uploads

**Frontend:**
- React
- React Router
- Axios
- React Datepicker

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GoRent
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd gorent-backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in `gorent-backend/` directory:
```env
# Server Configuration
PORT=5000
MONGO_URI=mongodb://localhost:27017/gorent

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# ImageKit Configuration (Optional - for image uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# OR production mode
npm start
```

The backend will run on `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd gorent-frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in `gorent-frontend/` directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

---

## Creating Admin User

To create an admin user, run the seed script:

```bash
cd gorent-backend
node seedAdmin.js
```

**Default Admin Credentials:**
- Email: `admin@gorent.com`
- Password: `admin123`

> ⚠️ **Important:** Change the admin password after first login!

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle (Admin only)
- `PUT /api/vehicles/:id` - Update vehicle (Admin only)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin only)

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking (Admin only)
- `DELETE /api/bookings/:id` - Cancel booking

---

## Project Structure

```
GoRent/
├── gorent-backend/
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── User.js
│   │   └── Vehicle.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── vehicleRoutes.js
│   ├── utils/
│   │   └── imagekit.js
│   ├── seedAdmin.js
│   ├── server.js
│   └── package.json
│
├── gorent-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Running in Production

### Backend
```bash
cd gorent-backend
npm start
```

### Frontend Build
```bash
cd gorent-frontend
npm run build
```

The built files will be in `gorent-frontend/build/`

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or check your MONGO_URI in .env
- For MongoDB Atlas, use the connection string from Atlas dashboard

### Image Upload Not Working
- Ensure ImageKit credentials are properly set in .env
- Check the ImageKit dashboard for correct public/private keys

### Port Already in Use
- Backend default port is 5000
- Frontend default port is 3000
- Change port in .env or package.json if needed

---

## License

ISC

