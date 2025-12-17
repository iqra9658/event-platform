# MERN Event Platform - Deployment Guide

## Table of Contents
- [Backend Deployment (Render)](#backend-deployment-render)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Testing Production](#testing-production)
- [Concurrency & Data Integrity](#concurrency--data-integrity)

---

## Backend Deployment (Render)

### Prerequisites
- GitHub account with repository pushed
- MongoDB Atlas account (free tier available)
- Render account (render.com)

### Step 1: Prepare Backend Repository

**Verify `server/package.json`:**
```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "Event Platform Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.0.1",
    "multer": "^2.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  },
  "engines": {
    "node": "18.x"
  }
}
```

**Verify `server/server.js` has:**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI not configured');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Start Server
const startServer = async () => {
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error('🚨 Failed to connect to MongoDB. Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
    return;
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();
```

**Create `server/.env.example`:**
```env
# Server Configuration
PORT=5000

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_platform

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your_32_character_jwt_secret_here

# Node Environment
NODE_ENV=production
```

**Verify `.gitignore` includes:**
```
node_modules/
.env
.env.local
.DS_Store
```

### Step 2: Push to GitHub

```bash
cd server
git add .
git commit -m "Backend ready for production deployment"
git push origin main
```

### Step 3: Create Render Web Service

1. **Go to [render.com](https://render.com)**
2. **Sign in with GitHub**
3. **Click "New +"** → **"Web Service"**
4. **Connect GitHub Repository:**
   - Select your repository
   - Select branch: `main`
   - Root Directory: `server`

5. **Configure Build & Deploy:**
   - **Name:** `event-platform-api` (or any name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

6. **Add Environment Variables (Critical):**
   - Click "Environment"
   - Add:
     ```
     Key: MONGODB_URI
     Value: mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/event_platform?retryWrites=true&w=majority
     
     Key: JWT_SECRET
     Value: (generate with: openssl rand -hex 32)
     
     Key: NODE_ENV
     Value: production
     
     Key: PORT
     Value: (leave blank - Render auto-assigns)
     ```

7. **Deploy:** Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `https://event-platform-api.onrender.com`

### Step 4: Get MongoDB Atlas Connection String

1. **Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**
2. **Create or access your cluster**
3. **Click "Connect"** → **"Connect your application"**
4. **Copy connection string:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/event_platform?retryWrites=true&w=majority
   ```
5. **Paste into Render Environment Variable: `MONGODB_URI`**

### Step 5: Test Backend API

Open your browser and test:
```
https://your-backend-url.onrender.com/health
```

Should respond: `{"status":"Server is running"}`

**Your Backend API URL is:** `https://your-backend-url.onrender.com/api`
(Example: `https://event-platform-api.onrender.com/api`)

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (vercel.com)
- Backend URL from above (e.g., `https://event-platform-api.onrender.com/api`)

### Step 1: Prepare Frontend Repository

**Verify `client/client/package.json`:**
```json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^5.14.0",
    "@mui/material": "^5.18.0",
    "@testing-library/react": "^16.3.1",
    "axios": "^1.13.2",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-router-dom": "^6.30.2",
    "react-scripts": "^5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

**Verify `client/client/src/utils/api.js` has:**
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
```

**Create `client/client/.env.example`:**
```env
# API URL (use backend URL from Render)
REACT_APP_API_URL=https://event-platform-api.onrender.com/api
```

### Step 2: Create `vercel.json` in root of frontend folder

**Create `client/client/vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_API_URL": "@react_app_api_url"
  }
}
```

### Step 3: Push to GitHub

```bash
cd client/client
git add .
git commit -m "Frontend ready for production deployment"
git push origin main
```

### Step 4: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"** → **"Import Git Repository"**
4. **Select your repository**
5. **Configure:**
   - **Framework:** React
   - **Root Directory:** `client/client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     Key: REACT_APP_API_URL
     Value: https://event-platform-api.onrender.com/api
     (Replace with your actual backend URL)
     ```

7. **Click "Deploy"**
   - Wait 2-3 minutes
   - You'll get a URL like: `https://your-app.vercel.app`

### Step 5: Update Backend CORS (if needed)

If frontend URL doesn't match, update `server/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

Then deploy backend again.

---

## Testing Production

### Test 1: Register New User
1. **Open:** `https://your-app.vercel.app/register`
2. **Fill form:**
   - Email: `prod-test@example.com`
   - Password: `testpass123`
   - Confirm: `testpass123`
3. **Click Register**
4. **Expected:** Redirect to Dashboard ✅

### Test 2: Create Event
1. **Click "Create Event"**
2. **Fill form:**
   - Title: `Production Test Event`
   - Description: `Testing production deployment`
   - Date: Tomorrow's date
   - Location: `Online`
   - Capacity: `5`
3. **Click "Create Event"**
4. **Expected:** Event appears on dashboard ✅

### Test 3: RSVP
1. **Click "Join"** on event
2. **Expected:** Button changes to "Leave", count updates to 1/5 ✅
3. **Refresh page** (test localStorage persistence)
4. **Expected:** Still shows you've joined ✅

### Test 4: Concurrency (Advanced)
1. **Create event with capacity 1**
2. **Open 2 browser windows side-by-side**
3. **Register 2 different accounts (or use incognito)**
4. **Both click "Join" simultaneously**
5. **Expected:** One succeeds, one gets "Event Full" error ✅

---

## Concurrency & Data Integrity

### How RSVP Prevents Overbooking

The backend uses **MongoDB Transactions** to ensure atomicity:

```javascript
// server/routes/events.js - RSVP Join Endpoint
router.post('/:id/join', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);

    // Check 1: Is there capacity?
    if (event.currentAttendees >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check 2: Is user already joined?
    const existingRSVP = await RSVP.findOne({ userId, eventId }).session(session);
    if (existingRSVP) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You have already joined' });
    }

    // Step 3: Create RSVP (atomic with capacity check)
    await RSVP.create([{ userId, eventId }], { session });

    // Step 4: Increment attendees
    event.currentAttendees += 1;
    await event.save({ session });

    // COMMIT: All steps succeed together or rollback completely
    await session.commitTransaction();
    res.json({ message: 'Successfully joined', event });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});
```

**Why This Matters:**
- **Without transactions:** Two requests could both see capacity=1 available, increment it to 2, violating the limit
- **With transactions:** Only one request succeeds, the other sees current attendees already at capacity
- **Guaranteed:** No data corruption, no race conditions, ACID compliance

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and connection string copied
- [ ] Backend `.env` file created with `MONGODB_URI` and `JWT_SECRET`
- [ ] Backend deployed to Render
- [ ] Backend health check responds: `/health` endpoint working
- [ ] Frontend `.env` file updated with backend URL
- [ ] Frontend deployed to Vercel
- [ ] CORS properly configured for both domains
- [ ] User registration tested in production
- [ ] Event creation tested in production
- [ ] RSVP join/leave tested in production
- [ ] Page refresh maintains login state (localStorage working)
- [ ] Concurrent RSVP requests tested (capacity enforcement working)

---

## Rollback & Redeploy

### If Backend Needs Update:
```bash
cd server
git add .
git commit -m "Fix: [describe change]"
git push origin main
# Render auto-deploys in ~1-2 minutes
```

### If Frontend Needs Update:
```bash
cd client/client
git add .
git commit -m "Fix: [describe change]"
git push origin main
# Vercel auto-deploys in ~30 seconds
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend can't connect to backend | Check `REACT_APP_API_URL` env var in Vercel |
| MongoDB connection fails | Verify IP whitelist on MongoDB Atlas includes `0.0.0.0/0` |
| CORS errors in console | Update Render CORS config to include frontend URL |
| Slow initial load | Normal for free tier; upgrade for better performance |
| 404 on deployed frontend | Check Vercel root directory is `client/client` |

---

## Support & Next Steps

- **Monitor:** Check Render dashboard for errors
- **Logs:** View Render/Vercel logs for debugging
- **Custom Domain:** Add custom domain in Vercel/Render settings
- **SSL:** Automatically enabled with Render/Vercel

🎉 **Your Event Platform is now live!**
