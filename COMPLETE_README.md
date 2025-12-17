# 🎪 Event Platform - MERN Stack Assignment

A **production-ready** full-stack event management platform with JWT authentication, RSVP system, and **concurrency-safe capacity enforcement using MongoDB transactions**.

## ✨ Features

✅ **JWT Authentication** - Secure register/login with bcrypt password hashing  
✅ **Event Management** - Create, read, update, delete events with image uploads  
✅ **RSVP System** - Join/leave events with real-time capacity tracking  
✅ **Concurrency Safety** - MongoDB transactions prevent overbooking during simultaneous requests  
✅ **Responsive UI** - Material-UI mobile-first design  
✅ **Protected Routes** - Only authenticated users access dashboard  
✅ **Event Filtering** - Shows only upcoming events (dateTime > now)

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Concurrency Safety Explained](#concurrency-safety-explained)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js** v16+ ([Download](https://nodejs.org))
- **MongoDB Atlas** free account ([Sign up here](https://www.mongodb.com/cloud/atlas))
- npm (included with Node.js)

### Step 1: MongoDB Atlas Setup (2 min)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Create M0 free cluster
3. Click "Add IP Address" → Allow 0.0.0.0/0 (allows from anywhere)
4. Create database user (save username & password)
5. Click "Connect" → Select "MongoDB for VS Code" → Copy connection string
6. Replace placeholders: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/event-platform?retryWrites=true&w=majority`

### Step 2: Backend Setup (1 min)

**Terminal 1:**
```bash
cd server
npm install
```

Create `.env` file in `server/` folder:
```env
# MongoDB Connection String (get from Atlas)
MONGODB_URI=mongodb+srv://yourUsername:yourPassword@cluster0.abc123.mongodb.net/event-platform?retryWrites=true&w=majority

# JWT Secret (any random string - change this!)
JWT_SECRET=mySecretKey12345

# Server Port
PORT=5000
```

Start backend:
```bash
npm run dev
```

✅ **Expected Output:**
```
✅ MongoDB connected successfully
🚀 Server is running on http://localhost:5000
📍 Listening on all interfaces (0.0.0.0:5000)
```

### Step 3: Frontend Setup (2 min)

**Terminal 2:**
```bash
cd client/client
npm install --legacy-peer-deps
npm start
```

✅ **Expected:** Browser opens http://localhost:3000 → Login page appears

---

## 📁 Project Structure

```
Event_platform_sample/
├── server/                          # Node.js + Express Backend
│   ├── models/
│   │   ├── User.js                 # { email, password (hashed), createdAt }
│   │   ├── Event.js                # { title, desc, dateTime, location, capacity, imageUrl, creator, currentAttendees }
│   │   └── RSVP.js                 # { userId, eventId } - unique compound index
│   ├── routes/
│   │   ├── auth.js                 # POST /register, /login (JWT tokens)
│   │   └── events.js               # GET/POST/PUT/DELETE + transaction RSVP
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   └── upload.js               # Multer image upload
│   ├── server.js                   # Express + MongoDB connection
│   ├── package.json
│   └── .env                        # MONGODB_URI, JWT_SECRET
│
├── client/client/                   # React Frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Token management + localStorage
│   │   ├── utils/
│   │   │   └── api.js              # Axios with Bearer token headers
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── Login.jsx           # Login form
│   │   │   ├── Register.jsx        # Registration form
│   │   │   ├── EventList.jsx       # Dashboard + RSVP buttons
│   │   │   ├── EventForm.jsx       # Create event form
│   │   │   └── ProtectedRoute.jsx  # Auth guard
│   │   ├── App.js                  # React Router setup
│   │   └── index.js
│   ├── package.json
│   ├── .env
│   └── vercel.json
│
└── README.md
```

---

## 🔐 How It Works

### Authentication Flow
```
User Registration
  ↓
  ├─ Email + Password captured in Register.jsx
  ├─ Password sent to backend
  ├─ Backend hashes with bcrypt (10 salt rounds)
  ├─ User saved to MongoDB
  └─ JWT token returned & stored in localStorage

User Login
  ↓
  ├─ Email + Password sent to backend
  ├─ Password verified with bcrypt.compare()
  ├─ JWT token generated (30-day expiry)
  └─ Token stored in localStorage for future requests

Protected Routes
  ↓
  ├─ AuthContext checks token on app load
  ├─ ProtectedRoute redirects to /login if missing
  ├─ All API calls include: Authorization: Bearer <token>
  └─ Backend middleware verifies token on each request
```

### RSVP System (Capacity Safety)

**Without Transactions (❌ BROKEN - causes overbooking):**
```
Event: "Conference 2025" - Capacity: 1

User A at T=0ms              User B at T=0ms
  ↓                             ↓
Check capacity ✓           Check capacity ✓
(sees 0 < 1)                (sees 0 < 1)
  ↓                             ↓
Increment to 1             Increment to 1
  ↓                             ↓
RESULT: Both joined, capacity exceeded! ❌
```

**With MongoDB Transactions (✅ FIXED - prevents overbooking):**
```
Event: "Conference 2025" - Capacity: 1

User A at T=0ms              User B at T=1ms (simultaneous)
  ↓                             ↓
START TRANSACTION         WAITS (locked)
Check capacity ✓          
  ↓
Check not joined ✓
  ↓
Increment to 1 ✓
  ↓
Save RSVP ✓
  ↓
COMMIT TRANSACTION        LOCK RELEASED
                               ↓
                          Check capacity ✗
                          (now 1 >= 1)
                               ↓
                          Returns "Event Full" ✓

RESULT: Only User A joined, User B gets error! ✅
```

**How MongoDB Transactions Work:**
```javascript
// Start a session - creates a "lock" on the event
const session = await mongoose.startSession();

// Begin transaction - all operations are atomic (all or nothing)
await session.withTransaction(async () => {
  // Step 1: Fetch event (locked from other transactions)
  const event = await Event.findById(eventId).session(session);
  
  // Step 2: Check capacity (no race condition possible)
  if (event.currentAttendees >= event.capacity) 
    throw new Error('Event is full');
  
  // Step 3: Check user not already joined
  if (await RSVP.findOne({userId, eventId}).session(session))
    throw new Error('Already joined');
  
  // Step 4: Increment attendees
  event.currentAttendees++;
  
  // Step 5: Save event
  await event.save({session});
  
  // Step 6: Create RSVP record
  await RSVP.create([{userId, eventId}], {session});
  
  // If ANY step fails → ENTIRE TRANSACTION ROLLS BACK
  // If ALL steps succeed → TRANSACTION COMMITS (database updated)
});
```

---

## 📋 API Endpoints

### Authentication
```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}
Response: { "token": "eyJhbGciOiJIUzI1NiIs..." }

POST /api/auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}
Response: { "token": "eyJhbGciOiJIUzI1NiIs..." }
```

### Events (all require Bearer token)
```
GET /api/events
Returns: { "events": [...] }

POST /api/events
{
  "title": "Tech Conference",
  "description": "Annual tech conference...",
  "dateTime": "2025-01-15T10:00:00",
  "location": "New York",
  "capacity": 100,
  "image": <file>
}
Response: { "event": {...} }

PUT /api/events/:id
Updates event (owner only)

DELETE /api/events/:id
Deletes event (owner only)

POST /api/events/:id/join
RSVP to event (with transaction concurrency)

POST /api/events/:id/leave
Cancel RSVP
```

---

## 🚢 Deployment

### Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on [Render.com](https://render.com)**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Set environment variables:
     ```
     MONGODB_URI=<your_mongodb_url>
     JWT_SECRET=<your_secret>
     PORT=5000
     ```
   - Build command: `npm install`
   - Start command: `npm start`
   - Deploy!

3. **Get Backend URL** (e.g., `https://event-platform.onrender.com`)

### Frontend Deployment (Vercel)

1. **Ensure `.env` is correct:**
   ```
   REACT_APP_API_URL=https://event-platform.onrender.com/api
   ```

2. **Push to GitHub** (if not already)

3. **Deploy on [Vercel](https://vercel.com)**
   - Import GitHub repository
   - Set environment variable:
     ```
     REACT_APP_API_URL=https://event-platform.onrender.com/api
     ```
   - Click "Deploy"
   - Live in seconds!

---

## 🧪 Testing Concurrency (Advanced)

### Load Test - Multiple Simultaneous RSVPs
```bash
# Terminal 1 - Start backend
cd server && npm run dev

# Terminal 2 - Create test event (note the event ID)
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Limited Event",
    "description": "Only 1 spot",
    "dateTime": "2025-01-20T10:00:00",
    "location": "Online",
    "capacity": 1
  }'

# Terminal 3 & 4 - Open 2 tabs, make simultaneous requests
curl -X POST http://localhost:5000/api/events/EVENT_ID/join \
  -H "Authorization: Bearer USER1_TOKEN"

curl -X POST http://localhost:5000/api/events/EVENT_ID/join \
  -H "Authorization: Bearer USER2_TOKEN"

# Result: Only ONE succeeds, other gets "Event Full" error ✅
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection fails | Check MONGODB_URI in .env, verify credentials in Atlas |
| "Cannot find module" error | Run `npm install` in the folder |
| CORS error in browser | Ensure backend .env has correct MongoDB URI |
| Token expired | Re-login to get new token |
| Event not showing | Check dateTime is in future format |
| Image upload fails | File must be < 50MB, refresh page if stuck |
| Frontend port already in use | Kill process: `lsof -ti :3000 \| xargs kill -9` (Mac/Linux) or use different port |

---

## 📚 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI library |
| | React Router v6 | Client-side routing |
| | Material-UI | Component library |
| | Axios | HTTP client |
| **Backend** | Node.js | JavaScript runtime |
| | Express | Web framework |
| | MongoDB | NoSQL database |
| | Mongoose | ODM |
| | JWT | Authentication tokens |
| | bcryptjs | Password hashing |
| **DevOps** | Render | Backend hosting |
| | Vercel | Frontend hosting |

---

## 📝 Notes for Production

### Security Best Practices
- ✅ JWT expires in 30 days
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Protected routes require token
- ✅ CORS enabled for deployed URLs
- ✅ Environment variables for secrets
- ⚠️ **TODO:** Rate limiting on auth endpoints
- ⚠️ **TODO:** HTTPS required (auto with Vercel/Render)

### Performance Optimization
- Images compressed before upload
- Database indexes on User email and Event dateTime
- Unique compound index on RSVP (userId + eventId)
- Pagination recommended for large event lists

---

## 🎓 Learning Outcomes

By building this app, you learned:
- ✅ Full-stack MERN development
- ✅ JWT authentication & authorization
- ✅ Database transactions & concurrency
- ✅ RESTful API design
- ✅ React hooks & context API
- ✅ Material-UI responsive design
- ✅ Environment configuration
- ✅ Deployment to cloud platforms

---

## 📄 License

MIT License - feel free to use for learning!

---

**Built as MERN Stack Intern Assignment** - Focus: Concurrency-safe RSVP system with MongoDB transactions 🚀
