# 🚗 GoRent - Vehicle Rental Platform

<div align="center">

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)

*A full-stack MERN application for vehicle rental management with user authentication, booking system, and admin dashboard.*

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [📱 Application Screenshots](#-application-screenshots)
- [🔌 API Documentation](#-api-documentation)
- [🏗️ Project Structure](#️-project-structure)
- [👤 Default Credentials](#-default-credentials)
- [🔒 Security Features](#-security-features)
- [📦 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Support](#-support)

---

## ✨ Features

### User Features
- 🔐 **User Registration & Login** - Secure JWT-based authentication
- 🚗 **Browse Vehicles** - View all available vehicles with details
- 🔍 **Search & Filter** - Search by name, brand, and filter by price
- 📅 **Book Vehicles** - Select dates and book vehicles instantly
- 📊 **User Dashboard** - View booking history and status
- 👤 **Profile Management** - Update name, email, and password

### Admin Features
- 📈 **Admin Dashboard** - Centralized management interface
- 🚙 **Vehicle Management** - Add, edit, delete, and toggle vehicle availability
- 📋 **Booking Management** - View all bookings and update status
- ✅ **Booking Workflow** - Confirm, complete, or cancel bookings
- ⚙️ **Profile Settings** - Manage admin account details

### System Features
- 🖼️ **Image Upload** - Local storage with ImageKit CDN support
- 🔒 **Role-based Access** - Secure admin-only routes
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Real-time Updates** - Live data synchronization
- 🛡️ **Input Validation** - Comprehensive form validation
- 🎨 **Modern UI** - Clean and intuitive interface

---

## 🛠️ Tech Stack

### Backend
| Technology | Description |
|------------|-------------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Fast, minimalist web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB object modeling |
| **JWT** | JSON Web Token authentication |
| **bcryptjs** | Password hashing |
| **Multer** | File upload middleware |
| **ImageKit** | Image CDN and optimization |
| **CORS** | Cross-origin resource sharing |

### Frontend
| Technology | Description |
|------------|-------------|
| **React** | Facebook UI library |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |
| **React Datepicker** | Date selection component |
| **CSS3** | Styling with custom properties |

---

## 🚀 Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package managers
- **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/GoRent.git
cd GoRent
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd gorent-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd gorent-frontend

# Install dependencies
npm install
```

---

### Environment Variables

Create a `.env` file in the `gorent-backend` directory with the following variables:

```env
# ====================
# Server Configuration
# ====================
PORT=5000
NODE_ENV=development

# ====================
# Database Configuration
# ====================
MONGO_URI=mongodb://localhost:27017/gorent
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gorent

# ====================
# JWT Configuration
# ====================
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# ====================
# ImageKit Configuration
# ====================
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# ====================
# Admin Reset Secret (Optional)
# ====================
ADMIN_SECRET=gorent-admin-reset
```

> **⚠️ Important**: Replace all placeholder values with your actual credentials in production!

For the frontend, create a `.env` file in `gorent-frontend` (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Running the Application

#### Start Backend Server

```bash
# Development mode (with auto-reload)
cd gorent-backend
npm run dev

# OR Production mode
npm start
```

The backend API will be available at: **http://localhost:5000**

#### Start Frontend Development Server

```bash
# In a new terminal
cd gorent-frontend
npm start
```

The frontend will be available at: **http://localhost:3000**

---

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/me` | Update user profile | Private |
| PUT | `/api/auth/admin-profile` | Update admin profile | Admin |

### Vehicle Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/vehicles` | Get all vehicles | Public |
| GET | `/api/vehicles/:id` | Get single vehicle | Public |
| POST | `/api/vehicles` | Create vehicle | Admin |
| PUT | `/api/vehicles/:id` | Update vehicle | Admin |
| DELETE | `/api/vehicles/:id` | Delete vehicle | Admin |

**Query Parameters** (GET /api/vehicles):
- `search` - Search by name or brand
- `brand` - Filter by brand
- `maxPrice` - Filter by maximum price

### Booking Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/bookings` | Get user bookings | Private |
| GET | `/api/bookings/all` | Get all bookings | Admin |
| POST | `/api/bookings` | Create booking | Private |
| PUT | `/api/bookings/:id/status` | Update booking status | Admin |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Private |
| DELETE | `/api/bookings/:id` | Delete booking | Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API health status |

---

## 🏗️ Project Structure

```
GoRent/
│
├── gorent-backend/
│   ├── middleware/
│   │   ├── adminMiddleware.js      # Admin authorization
│   │   └── authMiddleware.js       # JWT authentication
│   ├── models/
│   │   ├── Booking.js              # Booking schema
│   │   ├── User.js                 # User schema
│   │   └── Vehicle.js              # Vehicle schema
│   ├── routes/
│   │   ├── authRoutes.js           # Authentication routes
│   │   ├── bookingRoutes.js        # Booking routes
│   │   └── vehicleRoutes.js        # Vehicle routes
│   ├── utils/
│   │   └── imagekit.js             # ImageKit configuration
│   ├── uploads/
│   │   └── vehicles/               # Uploaded vehicle images
│   ├── seedAdmin.js                # Admin user seeder
│   ├── server.js                   # Express server entry
│   └── package.json
│
├── gorent-frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── logo.jpg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.js    # Confirmation modal
│   │   │   ├── Navbar.js           # Navigation bar
│   │   │   ├── ProtectedRoute.js   # Route protection
│   │   │   ├── ThemeProvider.js    # Theme context
│   │   │   └── Toast.js           # Toast notifications
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js  # Admin dashboard
│   │   │   ├── Booking.js          # User bookings
│   │   │   ├── Home.js             # Home/Vehicle listing
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js         # Registration page
│   │   │   └── UserDashboard.js    # User dashboard
│   │   ├── App.js                  # Main app component
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles
│   └── package.json
│
├── .gitignore
└── README.md                        # This file
```

---

## 👤 Default Credentials

After installation, an admin user is automatically created:

| Field | Value |
|-------|-------|
| **Email** | `admin@gorent.com` |
| **Password** | `admin123` |

> ⚠️ **Security Warning**: Change the admin password immediately after first login!

---

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Separate permissions for users and admins
- **Input Validation**: Server-side validation on all inputs
- **Error Handling**: Global error handling with appropriate HTTP status codes
- **CORS Configuration**: Configured for secure cross-origin requests
- **MongoDB Injection Prevention**: Parameterized queries via Mongoose

---

## 📦 Deployment

### Building for Production

```bash
# Build frontend
cd gorent-frontend
npm run build
```

The built files will be in `gorent-frontend/build/`

### Deploy to Production Server

1. **Set environment variables** on your production server
2. **Build the frontend** using `npm run build`
3. **Serve static files** from the `build` directory
4. **Use PM2** or similar for process management:

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start gorent-backend/server.js --name gorent-backend
```

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Render, Railway, Heroku, or DigitalOcean
- **Database**: MongoDB Atlas (cloud) or self-hosted MongoDB

---

<div align="center">

**Made with ❤️ by Nitesh Kumar Lodh**

*Vehicle Rental Made Simple*

</div>

