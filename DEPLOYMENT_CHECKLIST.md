# GoRent - Complete Setup Guide

## Default Admin Credentials

**Admin Account:**
- **Email:** admin@gorent.com
- **Password:** admin123
- **Role:** admin

To create the admin account, you need to run the seed script:

### Option 1: Run seed script locally
```bash
cd gorent-backend
node seedAdmin.js
```

### Option 2: Auto-create admin on server start
The admin will be created automatically when the server starts if it doesn't exist.

---

## Complete Deployment Steps

### Step 1: MongoDB Atlas Setup (CRITICAL)
1. Go to https://cloud.mongodb.com/
2. Select your project → Click **"Network Access"**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click Confirm
6. Wait 2 minutes

### Step 2: Deploy Backend to Render
1. Create Web Service on Render
2. Environment Variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = any random 32+ character string (e.g., `abc123xyz789def456ghi789jkl012mno345pqr`)
   - `PORT` = 10000
   - `NODE_ENV` = production

### Step 3: Deploy Frontend to Render
1. Create Static Site on Render
2. Environment Variable:
   - `REACT_APP_API_URL` = https://your-backend.onrender.com/api

### Step 4: Create Admin Account
After deployment, visit your backend URL to auto-create the admin:
- The admin account (admin@gorent.com / admin123) will be created automatically

Or run locally:
```bash
cd gorent-backend
node seedAdmin.js
```

---

## Testing the Application

### Test Registration:
1. Go to frontend URL
2. Click Register
3. Fill in details and register
4. Should redirect to dashboard

### Test Login:
1. Go to Login page
2. Use admin credentials:
   - Email: admin@gorent.com
   - Password: admin123
3. Should redirect to /admin

### Test Regular User:
1. Register a new user
2. Login with that user
3. Should redirect to /dashboard (not /admin)

---

## Troubleshooting

### "Server not responding" error:
- Check if backend is deployed
- Check environment variables in Render
- Check backend logs in Render dashboard

### "Invalid credentials" error:
- Make sure MongoDB is connected
- Check JWT_SECRET is set
- Check backend logs for errors

### "Database not available":
- MongoDB Atlas IP whitelist not configured - go back to Step 1

---

## Environment Variables Summary

| Variable | Backend Required | Frontend Required |
|----------|-----------------|------------------|
| MONGO_URI | ✅ Yes | ❌ No |
| JWT_SECRET | ✅ Yes | ❌ No |
| PORT | ✅ Yes (10000) | ❌ No |
| NODE_ENV | ✅ Yes (production) | ❌ No |
| REACT_APP_API_URL | ❌ No | ✅ Yes |

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/health | GET | No | Health check |
| /api/auth/register | POST | No | Register user |
| /api/auth/login | POST | No | Login user |
| /api/auth/me | GET | Yes | Get profile |
| /api/vehicles | GET | No | Get all vehicles |
| /api/vehicles | POST | Admin | Add vehicle |
| /api/bookings | POST | Yes | Create booking |
| /api/bookings | GET | Yes | Get user bookings |
| /api/bookings/all | GET | Admin | Get all bookings |

