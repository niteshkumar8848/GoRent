# GoRent Deployment Checklist - COMPLETE GUIDE

## ⚠️ STEP 0: MongoDB Atlas Setup (MUST DO FIRST)

Before deploying, you MUST add Render's IP to MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your project → Click **"Network Access"**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **Confirm**

Wait 1-2 minutes for changes to take effect.

This is the #1 cause of deployment failures!

---

## STEP 1: Backend Deployment (Render)

### 1. Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: gorent-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

### 2. Environment Variables
Add these in the Render dashboard:

| Variable | Value |
|----------|-------|
| MONGO_URI | `mongodb+srv://username:password@cluster.mongodb.net/gorent` |
| JWT_SECRET | Any random string (minimum 32 characters) |
| PORT | 10000 |
| NODE_ENV | production |

### 3. Deploy
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Check logs - you should see:
  - `GoRent Server Running Successfully`
  - `MongoDB Connected`

---

## STEP 2: Frontend Deployment (Render)

### 1. Create Static Site
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: gorent-frontend
   - **Build Command**: `npm run build`
   - **Publish directory**: `build`

### 2. Environment Variables
Add these:

| Variable | Value |
|----------|-------|
| REACT_APP_API_URL | `https://gorent-backend.onrender.com/api` |

**IMPORTANT**: Replace `gorent-backend` with your actual backend service name!

### 3. Deploy
- Click "Create Static Site"
- Wait for deployment

---

## STEP 3: Verify Deployment

### Test Backend Health
Visit: `https://your-backend.onrender.com/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "GoRent API is running",
  "mongodb": "connected",
  "server": "running"
}
```

### Test Frontend
Visit: `https://your-frontend.onrender.com`

---

## TROUBLESHOOTING

### Issue: "MongoDB Connection Error"
**Solution:**
- You did NOT add IP to MongoDB Atlas! Go back to STEP 0
- Or wait 2-3 minutes for IP whitelist to take effect

### Issue: 502 Bad Gateway
**Solution:**
- Check backend logs in Render dashboard
- Ensure MONGO_URI is correct
- Ensure JWT_SECRET is set

### Issue: CORS Errors
**Solution:**
- The server now automatically allows `.onrender.com` domains
- No additional CORS config needed

### Issue: Server Not Responding
**Solution:**
- Check if backend is deployed
- Check if environment variables are set correctly
- Check backend logs for errors

---

## Common Deployment Values

| Service | Example URL |
|---------|-------------|
| Backend | `https://gorent-backend.onrender.com` |
| Frontend | `https://gorent-frontend.onrender.com` |
| API | `https://gorent-backend.onrender.com/api` |

---

## Quick Checklist

- [ ] MongoDB Atlas: Added IP 0.0.0.0/0 to Network Access
- [ ] Backend: Deployed to Render
- [ ] Backend: MONGO_URI set
- [ ] Backend: JWT_SECRET set  
- [ ] Backend: PORT = 10000
- [ ] Backend: NODE_ENV = production
- [ ] Frontend: Deployed to Render
- [ ] Frontend: REACT_APP_API_URL set to backend URL
- [ ] Health check returns "ok"
- [ ] Can register/login
- [ ] Can view vehicles

