# GoRent Deployment Checklist for Render

## Pre-Deployment Checklist

### Backend (.env configuration)
- [ ] MONGO_URI is set (MongoDB Atlas connection string)
- [ ] JWT_SECRET is set (minimum 32 characters)
- [ ] PORT is set to 10000 (or leave empty for Render)
- [ ] NODE_ENV is set to "production"
- [ ] ALLOWED_ORIGINS is set to your frontend URL (optional - .onrender.com is auto-allowed)

### Frontend (environment configuration)
- [ ] REACT_APP_API_URL is set to your backend URL
  - Format: `https://your-backend-service.onrender.com/api`

---

## ⚠️ IMPORTANT: MongoDB Atlas IP Whitelist

Before deploying, you MUST add Render's IP to MongoDB Atlas:

### Steps:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your project → Click "Network Access"
3. Click "Add IP Address"
4. **For testing (NOT production):** Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click Confirm

### Why this is needed:
Render deploys your backend on dynamic IPs. MongoDB Atlas blocks connections from IPs not in the whitelist, causing the "Could not connect to any servers" error.

---

## Backend Deployment Steps (Render)

### 1. Create Backend Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: gorent-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for production)

### 2. Environment Variables
Add these in the Render dashboard:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gorent
JWT_SECRET=your_generated_jwt_secret_key
PORT=10000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

### 3. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL (e.g., `https://gorent-backend.onrender.com`)

---

## Frontend Deployment Steps (Render)

### 1. Create Frontend Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: gorent-frontend
   - **Build Command**: `npm run build`
   - **Publish directory**: `build`

### 2. Environment Variables
Add these in the Render dashboard:
```
REACT_APP_API_URL=https://gorent-backend.onrender.com/api
```

### 3. Deploy
- Click "Create Static Site"
- Wait for deployment to complete
- Note your frontend URL

---

## Post-Deployment Testing

### Test These Endpoints:

1. **Health Check**
   - URL: `https://your-backend.onrender.com/api/health`
   - Expected: JSON with status "ok"

2. **Get Vehicles**
   - URL: `https://your-backend.onrender.com/api/vehicles`
   - Expected: JSON array of vehicles

3. **Register User**
   - POST: `https://your-backend.onrender.com/api/auth/register`
   - Body: `{ "name": "Test User", "email": "test@example.com", "password": "test123" }`
   - Expected: Token and user object

4. **Login**
   - POST: `https://your-backend.onrender.com/api/auth/login`
   - Body: `{ "email": "test@example.com", "password": "test123" }`
   - Expected: Token and user object

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
```
MongoDB Connection Error: Could not connect to any servers in your MongoDB Atlas cluster
```
**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add IP 0.0.0.0/0 (allow all IPs for testing)
3. Wait 1-2 minutes for changes to apply

### Issue: 502 Bad Gateway
**Solution:**
1. Check backend logs in Render dashboard
2. Ensure MONGO_URI is correct
3. Ensure JWT_SECRET is set
4. Check if server is starting without errors

### Issue: CORS Errors
**Solution:**
1. The backend CORS is configured to allow `.onrender.com` domains automatically
2. Add your frontend URL to ALLOWED_ORIGINS if needed
3. Redeploy after changes

### Issue: Images Not Loading
**Solution:**
1. Ensure `/uploads` is configured as static in backend
2. Update frontend `getImageUrl` function to use production backend URL

### Issue: Registration/Login Fails
**Solution:**
1. Verify MongoDB Atlas network access (allow all IPs for testing)
2. Verify JWT_SECRET is set
3. Check backend logs for errors

---

## Production Security Recommendations

1. **JWT_SECRET**: Use a strong, random string
2. **CORS**: Whitelist only your frontend domain
3. **Rate Limiting**: Consider adding express-rate-limit
4. **MongoDB**: Use connection pooling and proper indexes
5. **Environment**: Keep NODE_ENV=production
6. **MongoDB IP**: Restrict to specific IPs after testing (not 0.0.0.0/0)

---

## Admin Account Setup

After deployment, create an admin user:

1. Register a new user via the frontend
2. Access MongoDB Atlas and update the user's role to "admin"
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

Or use the seed script:
```bash
cd gorent-backend
node seedAdmin.js
```

