# 🚀 DEPLOYMENT CHECKLIST: Git Push to Live Production

## PHASE 1: Pre-Deployment Preparation (15 minutes)

### A. Verify Local App is Running
- [ ] Backend server running: http://localhost:5000
  - Test: Open `http://localhost:5000/health` in browser
  - Expected response: `{"status":"Server is running"}`
- [ ] Frontend app running: http://localhost:3000
  - Test: Can see login/register page
- [ ] Both can communicate
  - Test: Try registering a user

### B. Backend Files Ready
- [ ] `server/package.json` exists with correct scripts:
  ```
  "start": "node server.js"
  "dev": "nodemon server.js"
  ```
- [ ] `server/server.js` has MongoDB connection with `process.env.MONGODB_URI`
- [ ] `server/.env.example` exists with:
  - `PORT=5000`
  - `MONGODB_URI=mongodb+srv://...`
  - `JWT_SECRET=your_32_char_secret`
  - `NODE_ENV=production`
- [ ] `server/.gitignore` includes `node_modules/` and `.env`
- [ ] No `.env` file in server folder (only `.env.example`)

### C. Frontend Files Ready
- [ ] `client/client/package.json` has React scripts
- [ ] `client/client/src/utils/api.js` uses `process.env.REACT_APP_API_URL`
- [ ] `client/client/.env.example` exists:
  ```
  REACT_APP_API_URL=https://your-backend-url.onrender.com/api
  ```
- [ ] `client/client/.gitignore` includes `node_modules/`, `.env`, `.env.local`
- [ ] No `.env` files in client folder (only `.env.example`)

### D. Git Setup
- [ ] Repository initialized: `git init`
- [ ] Files staged: `git add .`
- [ ] Initial commit: `git commit -m "MERN Event Platform"`
- [ ] Remote added: `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`
- [ ] Pushed to GitHub: `git push -u origin main`
- [ ] Verify on GitHub.com (both server and client folders visible)

---

## PHASE 2: Backend Deployment to Render (20 minutes)

### Step 1: Create MongoDB Atlas Database
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create free account (or sign in)
- [ ] Create new cluster (or use existing)
- [ ] Click "Connect" → "Connect your application"
- [ ] Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/event_platform`
- [ ] Note: Replace `<username>` and `<password>` with your actual credentials
- [ ] Save this connection string

### Step 2: Generate JWT Secret
**Option 1 - Mac/Linux:**
```bash
openssl rand -hex 32
# Output: 3f8k9j2k8d9k2j3k9d8k9d8k9d8k9d8k
```

**Option 2 - Windows PowerShell:**
```powershell
-join (1..32 | ForEach-Object { (0..9, 'a'..'f') | Get-Random })
# Output: 3f8k9j2k8d9k2j3k9d8k9d8k9d8k9d8k
```

- [ ] Copy the generated JWT secret (32 characters)

### Step 3: Deploy Backend to Render
- [ ] Go to https://render.com
- [ ] Sign in with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Select your GitHub repository
- [ ] Select branch: `main`
- [ ] Set Root Directory: `server`
- [ ] Configure:
  - Name: `event-platform-api`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance Type: `Free`

### Step 4: Add Environment Variables in Render
- [ ] In Render dashboard, click "Environment"
- [ ] Add these variables:
  ```
  MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/event_platform
  JWT_SECRET = (your generated 32-char secret)
  NODE_ENV = production
  ```
- [ ] Click "Save"
- [ ] Render will auto-deploy (takes 2-3 minutes)
- [ ] Wait until status shows "Live"

### Step 5: Test Backend API
- [ ] Copy your Render backend URL: `https://event-platform-api.onrender.com`
- [ ] In browser, test: `https://event-platform-api.onrender.com/health`
- [ ] Expected: `{"status":"Server is running"}`
- [ ] **SAVE THIS URL** - you'll need it for frontend

### Step 6: Verify Backend Health
- [ ] Test registration endpoint:
  ```bash
  curl -X POST https://your-backend.onrender.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123456"}'
  ```
- [ ] Should return JWT token (or "Email already registered" if exists)

---

## PHASE 3: Frontend Deployment to Vercel (15 minutes)

### Step 1: Create Environment File for Production
- [ ] In Vercel dashboard (next step), you'll set `REACT_APP_API_URL`
- [ ] Value: `https://event-platform-api.onrender.com/api` (from backend)

### Step 2: Deploy Frontend to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Click "Import Git Repository"
- [ ] Select your GitHub repository
- [ ] Configure:
  - Framework: `React`
  - Root Directory: `client/client`
  - Build Command: `npm run build`
  - Output Directory: `build`

### Step 3: Add Environment Variable
- [ ] In Vercel settings, click "Environment Variables"
- [ ] Add:
  ```
  Key: REACT_APP_API_URL
  Value: https://event-platform-api.onrender.com/api
  ```
- [ ] Click "Save"
- [ ] Vercel will auto-deploy (takes 1-2 minutes)

### Step 4: Get Frontend URL
- [ ] Wait for deployment to complete
- [ ] Vercel shows URL: `https://your-app.vercel.app`
- [ ] **SAVE THIS URL** - this is your production app

### Step 5: Test Frontend
- [ ] Open `https://your-app.vercel.app` in browser
- [ ] Should see login/register page
- [ ] Try registering
- [ ] **If blank page:** Check browser console (F12) for errors

---

## PHASE 4: Fix CORS (If Needed - 5 minutes)

### If Frontend Can't Reach Backend:
1. [ ] Check error in browser console (F12)
2. [ ] If CORS error, update `server/server.js`:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-app.vercel.app'
     ],
     credentials: true
   }));
   ```
3. [ ] Commit and push: `git push`
4. [ ] Render auto-deploys (1-2 minutes)
5. [ ] Test again

---

## PHASE 5: End-to-End Production Testing (10 minutes)

### Test 1: User Registration
- [ ] Go to `https://your-app.vercel.app/register`
- [ ] Register new account:
  - Email: `prod-test-1@example.com`
  - Password: `TestPass123`
- [ ] Click "Register"
- [ ] Expected: Redirect to dashboard ✅

### Test 2: User Login
- [ ] Go to `https://your-app.vercel.app/login`
- [ ] Log in with credentials from Test 1
- [ ] Expected: Redirect to dashboard ✅

### Test 3: Create Event
- [ ] Click "Create Event"
- [ ] Fill form:
  - Title: `Production Test Event`
  - Description: `Testing live deployment`
  - Date: (pick tomorrow's date)
  - Location: `Online`
  - Capacity: `3`
- [ ] Click "Create Event"
- [ ] Expected: Event appears in list ✅

### Test 4: RSVP Join
- [ ] Click "Join" on event
- [ ] Expected: Button changes to "Leave", attendee count increases to 1/3 ✅

### Test 5: Refresh Persistence
- [ ] Refresh page: `F5`
- [ ] Expected: Still logged in, RSVP status remembered ✅

### Test 6: RSVP Leave
- [ ] Click "Leave"
- [ ] Expected: Button changes back to "Join", count decreases to 0/3 ✅

### Test 7: Concurrency (Advanced Test)
- [ ] Create event with capacity 1
- [ ] Open 2 browser windows
- [ ] In window 1: Log in as User A
- [ ] In window 2: Log in as User B (register new account if needed)
- [ ] Both find the same 1-capacity event
- [ ] Both click "Join" simultaneously (within 1 second)
- [ ] Expected: One succeeds (1/1), other gets "Event Full" error ✅

### Test 8: Create Different Event
- [ ] Create another event with different details
- [ ] Expected: Both events visible on dashboard ✅

### Test 9: Delete Event
- [ ] Find event you created
- [ ] If you're the creator, should see "Delete" button
- [ ] Click "Delete"
- [ ] Expected: Event removed from list ✅

---

## PHASE 6: Production Monitoring (5 minutes)

### Backend Monitoring
- [ ] Open Render dashboard
- [ ] Select your backend service
- [ ] Check "Logs" tab for any errors
- [ ] If you see errors, review and fix locally, then push again

### Frontend Monitoring
- [ ] Open Vercel dashboard
- [ ] Select your frontend project
- [ ] Check "Deployments" tab
- [ ] Latest should show "Ready" status
- [ ] If failed, click to view build logs

### Database Monitoring
- [ ] Go to MongoDB Atlas dashboard
- [ ] Select your cluster
- [ ] Check "Database" tab
- [ ] Should see documents in `users`, `events`, and `rsvps` collections

---

## PHASE 7: Setup Custom Domain (Optional - 10 minutes)

### Add Custom Domain to Vercel
- [ ] Open Vercel project settings
- [ ] Go to "Domains"
- [ ] Add your custom domain (e.g., myapp.com)
- [ ] Follow Vercel's DNS setup instructions
- [ ] Wait for DNS propagation (5-24 hours)

### Add Custom Domain to Render (Backend)
- [ ] Open Render service settings
- [ ] Go to "Custom Domains"
- [ ] Add your custom API domain (e.g., api.myapp.com)
- [ ] Update frontend `REACT_APP_API_URL` in Vercel to new domain
- [ ] Redeploy frontend

---

## FINAL CHECKLIST: All Systems Go ✅

- [ ] Backend running on Render (status: Live)
- [ ] Backend responding to health check
- [ ] Frontend running on Vercel (status: Ready)
- [ ] Frontend loads without errors
- [ ] User can register in production
- [ ] User can login in production
- [ ] User can create events in production
- [ ] User can join/leave events in production
- [ ] RSVP count updates correctly
- [ ] Event deletion works for creator
- [ ] localStorage persists login state
- [ ] RSVP concurrency prevents overbooking
- [ ] No CORS errors in browser console
- [ ] Render logs show no critical errors
- [ ] MongoDB has test data (documents in collections)

---

## 🎉 CONGRATULATIONS!

Your MERN Event Platform is now **LIVE** and **PRODUCTION-READY**! 🚀

### Your Live URLs:
- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://event-platform-api.onrender.com/api
- **Database:** MongoDB Atlas (check dashboard)

### Next Steps:
1. **Monitor:** Check logs daily for first week
2. **Scale:** Upgrade Render/Vercel as traffic increases
3. **Backup:** Enable backups on MongoDB
4. **Custom Domain:** Add your own domain for professional look
5. **Email:** Add email verification (optional enhancement)

---

## Troubleshooting Reference

| Problem | Solution |
|---------|----------|
| Frontend blank page | Check console (F12), verify `REACT_APP_API_URL` |
| Can't login | Check MongoDB connection in Render logs |
| CORS error | Update origin in `server.js` to include Vercel URL |
| Events not loading | Test backend `/api/events` endpoint directly |
| RSVP not working | Check MongoDB transaction logs in Atlas |
| Render 502 error | Restart service, check logs for crash |
| Vercel 500 error | Check build logs, verify npm dependencies |

---

**Last Updated:** Production Ready
**Version:** 1.0.0
**Status:** ✅ Live and Tested
