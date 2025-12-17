# 🚀 DEPLOY NOW - Your Credentials Ready!

Your MongoDB and JWT credentials are configured. Now deploy in 2 minutes!

---

## ✅ Step 1: Deploy Backend to Render

1. Go to: **https://render.com**
2. Sign up with **GitHub** (authorize)
3. Click **"New +"** → **"Web Service"**
4. Select your repo: **iqra9658/event-platform**
5. **Configuration** (auto-filled from render.yaml):
   - **Name:** event-platform-api
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. **Add Environment Variables:**
   - KEY: `MONGODB_URI`
   - VALUE: `mongodb+srv://fatima3342019_db_user:fDC1qqhyQ85boD01@cluster0.wlpa125.mongodb.net/event_platform?retryWrites=true&w=majority`
   - Click "Add Variable"
   - KEY: `JWT_SECRET`
   - VALUE: `MYEVENT5986@45`
   - Click "Add Variable"
   - KEY: `NODE_ENV`
   - VALUE: `production`
7. Click **"Create Web Service"**
8. **Wait 2-3 minutes** for deployment
9. **Copy your backend URL** when it says "Your service is live!"
   - Example: `https://event-platform-api-abc123.onrender.com`

---

## ✅ Step 2: Deploy Frontend to Vercel

1. Go to: **https://vercel.com**
2. Sign up with **GitHub** (authorize)
3. Click **"Add New"** → **"Project"**
4. Select your repo: **iqra9658/event-platform**
5. **Configuration:**
   - **Root Directory:** `./client/client`
6. **Add Environment Variable:**
   - NAME: `REACT_APP_API_URL`
   - VALUE: (Paste your Render backend URL from Step 1 + `/api`)
   - Example: `https://event-platform-api-abc123.onrender.com/api`
7. Click **"Deploy"**
8. **Wait 1-2 minutes** for deployment
9. **Your app is LIVE!** 🎉
   - Frontend URL: `https://event-platform-xxx.vercel.app`

---

## ✅ Testing

1. Open your **Vercel URL** (from Step 2)
2. **Register** with any email/password
3. **Create Event** → Fill in details
4. **Join Event** → Should work instantly!
5. **Logout & Login** → Should remember you

---

## 🔄 Auto-Updates

After deployment, just push to GitHub and both services auto-redeploy:

```powershell
git add .
git commit -m "Your changes"
git push
```

---

## 📋 Your Credentials (Reference)

```
MongoDB URI: mongodb+srv://fatima3342019_db_user:fDC1qqhyQ85boD01@cluster0.wlpa125.mongodb.net/event_platform?retryWrites=true&w=majority
JWT_SECRET: MYEVENT5986@45
```

---

**Go deploy now! 2 minutes to LIVE! 🚀**
