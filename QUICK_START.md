# 📋 QUICK REFERENCE: Deployment Summary

## Your Production URLs (After Deployment)

```
Frontend: https://your-app.vercel.app
Backend:  https://event-platform-api.onrender.com
API Base: https://event-platform-api.onrender.com/api
```

---

## 3 Easy Steps to Deploy

### 1️⃣ Backend to Render (20 min)
```bash
# Create MongoDB Atlas DB
# Get connection string from mongodb.com/cloud/atlas

# Generate JWT Secret
openssl rand -hex 32  # or use PowerShell equivalent

# Go to render.com → Create Web Service
# - Connect GitHub repo
# - Set root directory: server
# - Add env vars: MONGODB_URI, JWT_SECRET, NODE_ENV=production
# - Deploy!
```

### 2️⃣ Frontend to Vercel (15 min)
```bash
# Go to vercel.com → Import Git Repository
# - Select repository
# - Root directory: client/client
# - Add env var: REACT_APP_API_URL=https://your-backend.onrender.com/api
# - Deploy!
```

### 3️⃣ Test Everything (10 min)
```bash
# Open https://your-app.vercel.app
# 1. Register new user
# 2. Create event
# 3. Join event
# 4. Refresh (test localStorage)
# 5. Done! ✅
```

---

## Environment Variables

### Backend (.env in Render)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/event_platform
JWT_SECRET=your_32_character_secret_generated_by_openssl
NODE_ENV=production
PORT=5000
```

### Frontend (.env in Vercel)
```
REACT_APP_API_URL=https://event-platform-api.onrender.com/api
```

---

## Key Files to Check Before Deployment

- ✅ `server/package.json` - Has `"start": "node server.js"`
- ✅ `server/server.js` - Uses `process.env.MONGODB_URI`
- ✅ `client/client/package.json` - Has React scripts
- ✅ `client/client/src/utils/api.js` - Uses `process.env.REACT_APP_API_URL`
- ✅ `.gitignore` in both - Includes `node_modules/` and `.env`

---

## Concurrency Safety: How RSVP Works

**The Problem:** If event has capacity 1 and 2 users join simultaneously, both might see "available" before increment.

**The Solution:** MongoDB Transactions (ACID compliance)
```javascript
// Both steps are atomic: check capacity + increment
// Either both succeed or both rollback
// Guaranteed: Never overbooking!
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Blank frontend | Check `REACT_APP_API_URL` in Vercel env var |
| Can't connect to backend | Check CORS in `server.js` includes Vercel URL |
| MongoDB won't connect | Verify connection string in Render env var |
| Events not loading | Test: `https://your-backend.onrender.com/api/events` |

---

## See Also
- **DEPLOYMENT.md** - Complete step-by-step guide
- **CHECKLIST.md** - Full deployment checklist with all phases
- **README.md** - Project overview
