# ⚙️ Environment Setup Guide

## 🔧 MongoDB Atlas Setup (5 minutes)

### Step 1: Create Free Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (email + password)
3. Create free M0 cluster

### Step 2: Network Access
1. Click "Network Access" (left menu)
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 3: Database User
1. Click "Database Access" (left menu)
2. Click "Add New Database User"
3. Username: `iqramirza9603` (or your choice)
4. Password: Generate secure password (or use `Iqra@mirza9603`)
5. Click "Add User"

### Step 4: Get Connection String
1. Click "Databases" (left menu)
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials

**Example Format:**
```
mongodb+srv://iqramirza9603:Iqra@mirza9603@cluster0.abc123.mongodb.net/event-platform?retryWrites=true&w=majority
```

---

## 📝 Backend Environment (.env)

**File Location:** `server/.env`

```env
# MongoDB Connection String (from Atlas)
MONGODB_URI=mongodb+srv://iqramirza9603:Iqra@mirza9603@cluster0.abc123.mongodb.net/event-platform?retryWrites=true&w=majority

# JWT Secret (keep it secret! change this for production)
JWT_SECRET=eventsecret234

# Server Port (default: 5000)
PORT=5000

# Optional: Cloudinary for image uploads
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

### How to Set .env:
```bash
cd server

# Create .env file with content above
# Or copy from .env.local and rename
```

---

## 📝 Frontend Environment (.env)

**File Location:** `client/client/.env`

```env
# Local Development
REACT_APP_API_URL=http://localhost:5000/api

# Production (uncomment when deployed)
# REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### How to Set .env:
```bash
cd client/client

# Create .env file with content above
```

---

## 🔑 JWT Secret Best Practices

### Don't Use (❌ Weak)
```env
JWT_SECRET=123456
JWT_SECRET=password
JWT_SECRET=secret
```

### Use Instead (✅ Strong)
```env
# Generate random string:
# openssl rand -base64 32

JWT_SECRET=xK9mPqR2wL5nJ8yH4gB7vC3dF6sT1uA9
JWT_SECRET=Qu3mN5xP8rJ2kL4hG6wT9vB3sD7yF1cA
JWT_SECRET=Z2mX4cV6bN8aS3dF5gH7jK9lP1qW0eR
```

---

## 🔍 Verify Environment Setup

### Backend
```bash
cd server

# Check MongoDB connection
npm run dev

# Should see:
# ✅ MongoDB connected successfully
# 🚀 Server running on http://localhost:5000
```

### Frontend
```bash
cd client/client

# Check API URL
npm start

# Should see:
# Compiled successfully!
# Local: http://localhost:3001
```

---

## 🛠️ Common Environment Issues

### Issue: "Cannot connect to MongoDB"
**Cause:** Wrong MONGODB_URI or IP not whitelisted  
**Fix:**
1. Check IP is whitelisted in MongoDB Atlas (0.0.0.0/0)
2. Verify username & password in connection string
3. Ensure cluster is running (green status in Atlas)

### Issue: "API calls failing" (CORS error)
**Cause:** Wrong REACT_APP_API_URL  
**Fix:**
1. Check REACT_APP_API_URL in `client/client/.env`
2. Should be: `http://localhost:5000/api`
3. Restart React after changing .env

### Issue: "Token invalid" errors
**Cause:** JWT_SECRET mismatch  
**Fix:**
1. If you changed JWT_SECRET in .env
2. Existing tokens from old secret become invalid
3. Clear localStorage: `localStorage.clear()`
4. Re-login to get new token

### Issue: "Port already in use"
**Cause:** Another process using :5000 or :3001  
**Fix:**
- Backend on :5000: Change PORT in `.env`
- Frontend on :3001: React will auto-use next available port

---

## 📦 Installing Dependencies

### Backend
```bash
cd server
npm install

# Should install:
# - express, mongoose, cors
# - jwt, bcryptjs, dotenv
# - multer, cloudinary
# - nodemon (dev dependency)
```

### Frontend
```bash
cd client/client
npm install --legacy-peer-deps

# Should install:
# - react, react-dom, react-router-dom
# - @mui/material, @emotion/react, @emotion/styled
# - axios
# - react-scripts, webpack, babel
```

---

## 🚀 Start Everything

### Terminal 1 - Backend
```bash
cd server
npm run dev

# Expected output:
[nodemon] watching path(s): *.*
✅ MongoDB connected successfully
🚀 Server is running on http://localhost:5000
📍 Listening on all interfaces (0.0.0.0:5000)
```

### Terminal 2 - Frontend
```bash
cd client/client
npm start

# Expected output:
Compiled successfully!
Local:            http://localhost:3001
webpack compiled successfully
```

---

## 🧪 Test User Credentials

**Default Test User:**
```
Email: test@example.com
Password: test123
```

### Create Test User via Register
1. Go to http://localhost:3001/register
2. Email: any@email.com
3. Password: any password
4. Click Register
5. Auto-logged in to dashboard

---

## 🔐 Security Checklist

- ✅ JWT_SECRET is random (not "secret" or "123")
- ✅ MongoDB credentials in .env (not committed to git)
- ✅ IP 0.0.0.0/0 only for development (restrict in production)
- ✅ HTTPS enforced in production (Render/Vercel handle this)
- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ Environment files not committed to GitHub

---

## 📋 Environment Checklist

Before starting, verify:

- ✅ `server/.env` exists with MONGODB_URI & JWT_SECRET
- ✅ `client/client/.env` exists with REACT_APP_API_URL
- ✅ MongoDB Atlas cluster is running (green status)
- ✅ IP 0.0.0.0/0 whitelisted in Atlas
- ✅ Database user created with password
- ✅ `npm install` completed in both folders
- ✅ Node.js v16+ installed (`node -v`)
- ✅ npm v7+ installed (`npm -v`)

---

## 🆘 Get Help

**Backend not connecting to MongoDB?**
- Check MongoDB Atlas console for errors
- Verify connection string in .env
- Try pasting connection string in MongoDB Compass to test

**Frontend API calls failing?**
- Check browser DevTools Network tab
- Verify backend is running on :5000
- Check REACT_APP_API_URL in .env

**Confused about .env?**
- See `server/.env.local` for example
- See comments in `server/.env` for explanations
- Files are NOT committed to git (for security)

---

**Ready? Run `npm run dev` in server and `npm start` in client!** 🚀
