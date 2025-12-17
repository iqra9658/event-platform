# 🔧 COPY-PASTE COMMANDS: Deployment Reference

## Generate JWT Secret (COPY-PASTE READY)

### Mac/Linux:
```bash
openssl rand -hex 32
```

### Windows PowerShell:
```powershell
-join (1..32 | ForEach-Object { (0..9, 'a'..'f') | Get-Random })
```

**Output example:** `3f8a9b2d1c7e4a5f9b3d2e1f8a7c6b9d`

---

## MongoDB Connection String Template

Replace the placeholders:
```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/event_platform
```

**Example (DO NOT USE - just example):**
```
mongodb+srv://user123:Pass1234@cluster0.abcdef.mongodb.net/event_platform
```

---

## Backend Environment Variables (For Render)

Copy-paste this into Render Environment Variables form:

```
MONGODB_URI = mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/event_platform
JWT_SECRET = (paste your generated 32-char secret)
NODE_ENV = production
PORT = (leave blank - Render assigns automatically)
```

---

## Frontend Environment Variables (For Vercel)

Copy-paste this into Vercel Environment Variables form:

```
REACT_APP_API_URL = https://event-platform-api.onrender.com/api
```

(Replace `event-platform-api` with your actual Render service name)

---

## Test Endpoints (After Deployment)

### Health Check:
```
https://your-backend.onrender.com/health
```
Expected: `{"status":"Server is running"}`

### List Events:
```
https://your-backend.onrender.com/api/events
```
Expected: JSON array of events

### Register User:
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```
Expected: `{"token":"eyJhbGc...", "user":{"_id":"...", "email":"test@example.com"}}`

### Login User:
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```
Expected: `{"token":"eyJhbGc...", "user":{"_id":"...", "email":"test@example.com"}}`

---

## Git Commands (Pre-Deployment)

### Initialize Repository:
```bash
cd /path/to/Event_platform_sample
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "MERN Event Platform - Production Ready"
```

### Create GitHub Repository and Push:
```bash
# Create repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/event-platform.git
git branch -M main
git push -u origin main
```

### Push Updated Code (After Changes):
```bash
git add .
git commit -m "Fix: [describe change]"
git push origin main
```

---

## Local Development Commands

### Terminal 1 - Backend:
```bash
cd server
npm install
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd client/client
npm install
npm start
```

---

## Render Deployment Commands (Optional - Use Web UI Instead)

If using Render CLI:
```bash
npm install -g render-cli
render login
render create
render env:set MONGODB_URI "mongodb+srv://..."
render env:set JWT_SECRET "..."
render deploy
```

---

## Vercel Deployment Commands (Optional - Use Web UI Instead)

If using Vercel CLI:
```bash
npm install -g vercel
vercel login
cd client/client
vercel
vercel env:add REACT_APP_API_URL
```

---

## MongoDB Atlas Setup Commands

### Connect to Database from CLI:
```bash
# Install MongoDB CLI
brew install mongodb-cli  # Mac
# or: choco install mongodb-cli  # Windows

# Connect to your cluster
mongosh "mongodb+srv://username:password@cluster.mongodb.net/event_platform"
```

### View Collections in Database:
```javascript
// In mongosh shell:
use event_platform
show collections
db.users.find().pretty()
db.events.find().pretty()
db.rsvps.find().pretty()
```

---

## Environment File Templates

### server/.env.example
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_platform
JWT_SECRET=your_32_character_secret_here
NODE_ENV=production
```

### client/client/.env.example
```
REACT_APP_API_URL=https://event-platform-api.onrender.com/api
```

---

## Check If Ports Are Available

### Mac/Linux:
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process on port 5000
lsof -ti :5000 | xargs kill -9

# Check if port 3000 is in use
lsof -i :3000
```

### Windows PowerShell:
```powershell
# Check if port 5000 is in use
Get-Process | Where-Object { $_.Handles -gt 0 } | Where-Object { $_.Name -like "*node*" }

# Kill process on port 5000
Stop-Process -Name node -Force

# Use netstat
netstat -ano | findstr :5000
```

---

## Install Global Dependencies (If Needed)

```bash
# Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node.js (recommended: v18 or v20)
node --version  # Check current
nvm install 20
nvm use 20

# Nodemon (for development)
npm install -g nodemon

# MongoDB CLI
npm install -g mongodb-cli
```

---

## Database Backup Commands

### Export Collections:
```bash
# From MongoDB Atlas dashboard → Collections → ⋯ → Export Collection

# Or via CLI:
mongoexport --uri "mongodb+srv://user:pass@cluster.mongodb.net/event_platform" \
  --collection users \
  --out users_backup.json
```

### Import Collections:
```bash
mongoimport --uri "mongodb+srv://user:pass@cluster.mongodb.net/event_platform" \
  --collection users \
  --file users_backup.json
```

---

## View Live Logs

### Render Backend Logs:
```bash
# Via Render Dashboard → Logs tab
# Or via CLI:
render logs --follow
```

### Vercel Frontend Logs:
```bash
# Via Vercel Dashboard → Deployments → Logs
# Or via CLI:
vercel logs
```

### MongoDB Atlas Logs:
```bash
# Via MongoDB Dashboard → Monitoring → Logs
# Or via mongosh:
use admin
db.getLog("global")
```

---

## Performance Monitoring

### Check MongoDB Connection:
```javascript
// In mongosh:
db.runCommand({ping: 1})
// Expected: { ok: 1 }
```

### Check Render Service Status:
```bash
curl -I https://your-backend.onrender.com/health
# Expected: HTTP/1.1 200 OK
```

### Check Vercel Deployment:
```bash
curl -I https://your-app.vercel.app
# Expected: HTTP/2 200
```

---

## Common Error Fixes

### MongoDB Connection Error:
```javascript
// Check error message
// "not authorized" → Check username/password
// "SSL/TLS error" → Click "Allow All" in IP whitelist
// "connection timed out" → Check internet connection
```

### CORS Error in Browser:
```javascript
// Update server.js:
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
  credentials: true
}));
// Then git push to redeploy
```

### "Port Already in Use":
```bash
# Mac/Linux:
kill -9 $(lsof -t -i:5000)

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## Quick Deployment Recap

```bash
# 1. Local setup
cd Event_platform_sample
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/YOU/event-platform
git push -u origin main

# 2. Go to render.com
#    → Create Web Service
#    → Connect GitHub → Select repo
#    → Root Directory: server
#    → Build: npm install, Start: npm start
#    → Environment: MONGODB_URI, JWT_SECRET, NODE_ENV=production

# 3. Go to vercel.com
#    → New Project → Import Git Repo
#    → Root Directory: client/client
#    → Environment: REACT_APP_API_URL=https://backend.onrender.com/api

# 4. Test
#    → Open https://your-app.vercel.app
#    → Register, create event, join RSVP
#    → Done! ✅
```

---

## Useful URLs

- **GitHub:** https://github.com/new (create repo)
- **Render:** https://render.com
- **Vercel:** https://vercel.com
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Node.js:** https://nodejs.org
- **React:** https://react.dev
- **Express:** https://expressjs.com
- **Mongoose:** https://mongoosejs.com

---

**Copy-paste these commands as needed during deployment!**
