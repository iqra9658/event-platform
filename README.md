# 🎪 Event Platform - MERN Stack Assignment

A production-ready full-stack event management platform built with MongoDB, Express, React, and Node.js. Features JWT authentication, real-time event management, and **concurrency-safe RSVP with MongoDB transactions**.

## ✨ Core Features

✅ **User Authentication** - JWT-based secure registration/login with bcrypt password hashing
✅ **Event CRUD** - Create/Read/Update/Delete events with image upload
✅ **Event Dashboard** - Filter upcoming events (dateTime > now), sorted by date  
✅ **RSVP System** - Join/leave events with capacity enforcement
✅ **Concurrency Safety** - MongoDB transactions prevent overbooking on simultaneous requests
✅ **Responsive UI** - Mobile-first Material-UI design
✅ **Protected Routes** - Only authenticated users access dashboard
✅ **Capacity Control** - Prevent overbooking with atomic transactions
✅ **Event Management** - Create, edit, and delete your own events
✅ **Responsive UI** - Material-UI components for desktop, tablet, and mobile
✅ **Secure** - Protected routes, password hashing, JWT tokens

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)
- CORS, Multer

**Frontend:**
- React 19
- React Router v6
- Material-UI (MUI)
- Axios
- TailwindCSS compatible

## Project Structure

```
Event_platform_sample/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── RSVP.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── events.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── EventForm.jsx
    │   │   └── EventList.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.js
    ├── public/
    ├── package.json
    └── .env
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (free tier available)

### Backend Setup

1. **Navigate to server folder**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_platform
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   ```

5. **Get MongoDB URI:**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/database`

6. **Start server**
   ```bash
   npm start          # Production
   npm run dev        # Development (with nodemon)
   ```

   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client folder**
   ```bash
   cd client/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start React dev server**
   ```bash
   npm start
   ```

   Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
```

### Events
```
GET    /api/events                  - Get all upcoming events
GET    /api/events/:id              - Get event by ID
POST   /api/events                  - Create event (auth required)
PUT    /api/events/:id              - Update event (creator only)
DELETE /api/events/:id              - Delete event (creator only)
POST   /api/events/:id/join         - Join event (auth required)
POST   /api/events/:id/leave        - Leave event (auth required)
GET    /api/events/:id/attendees    - Get event attendees
GET    /api/events/:id/check-rsvp   - Check if user joined (auth required)
```

## Concurrency Safety - MongoDB Transactions

The RSVP join/leave functionality implements **MongoDB transactions** to ensure atomicity and prevent race conditions:

### Problem Solved
- **Race Condition**: Multiple users trying to join when capacity is 1 left
- **Duplicate RSVPs**: User joining same event twice simultaneously
- **Atomic Operations**: Capacity check + RSVP creation happen together

### Implementation

**Join Event with Transaction:**
```javascript
router.post('/:id/join', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // All operations are atomic - either all succeed or all fail
    const event = await Event.findById(eventId).session(session);
    
    // Check capacity BEFORE incrementing
    if (event.currentAttendees >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check for duplicate RSVP
    const existingRSVP = await RSVP.findOne({ userId, eventId }).session(session);
    if (existingRSVP) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Already joined' });
    }

    // Create RSVP and increment atomically
    await RSVP.create([{ userId, eventId }], { session });
    event.currentAttendees += 1;
    await event.save({ session });

    await session.commitTransaction();
  } finally {
    session.endSession();
  }
});
```

### Why This Matters
- **Without transactions**: Thread A checks capacity (OK), Thread B checks capacity (OK), both threads increment → overbooking
- **With transactions**: All checks and updates are atomic → guaranteed consistency

## Usage

### User Flow

1. **Register/Login**
   - Create account or login with credentials
   - JWT token stored in localStorage

2. **View Events**
   - Browse all upcoming events
   - See capacity and attendee count

3. **RSVP to Event**
   - Click "Join Event" button
   - Capacity check prevents overbooking
   - Event appears in your joined events

4. **Create Event**
   - Click "Create Event"
   - Fill form (title, desc, date, location, capacity)
   - Optional: Upload event image
   - Event appears in "My Created Events"

5. **Manage Events**
   - Edit event details (title, capacity, etc.)
   - Delete your events (deletes all RSVPs too)
   - View who joined your events

## Security Features

- **Password Hashing**: bcryptjs with salt rounds (10)
- **JWT Tokens**: 7-day expiration
- **Protected Routes**: Frontend redirects unauthorized users
- **Authorization**: Only creators can edit/delete events
- **Input Validation**: Server-side validation on all inputs
- **CORS**: Configured for frontend-backend communication

## Performance Optimizations

- **Database Indexing**: Indexed on date and creator fields
- **Populated References**: Efficiently fetch creator details
- **Memory Storage**: Multer uses memory for fast image processing
- **Session Management**: Token-based, no server sessions needed

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_strong_secret_key
CLOUDINARY_CLOUD_NAME=optional
CLOUDINARY_API_KEY=optional
CLOUDINARY_API_SECRET=optional
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment

### Deploy Backend (Heroku/Railway)
```bash
cd server
git push heroku main
# Update MONGODB_URI in config vars
```

### Deploy Frontend (Vercel/Netlify)
```bash
cd client/client
npm run build
# Deploy `build/` folder to Vercel/Netlify
```

## Testing RSVP Concurrency

To test concurrency safety:

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client/client && npm start

# Terminal 3: Run stress test
# Create event with capacity 1
# Quickly try joining from 2 different browser tabs
# Only 1 user will succeed (concurrency safe!)
```

## Troubleshooting

**MongoDB Connection Error**
- Verify MONGODB_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure cluster is running

**CORS Errors**
- Backend CORS configured for http://localhost:3000
- Update if frontend runs on different port

**Token Expired**
- Clear localStorage and login again
- Check JWT_SECRET consistency

**Port Already in Use**
- Change PORT in .env (default: 5000)
- Kill process: `lsof -ti:5000 | xargs kill -9`

## Future Enhancements

- [ ] Image upload to Cloudinary
- [ ] Event categories and filtering
- [ ] Email notifications on RSVP
- [ ] Calendar view
- [ ] Event reviews and ratings
- [ ] Admin dashboard
- [ ] Real-time notifications (Socket.io)
- [ ] User profile management
- [ ] Event search and advanced filters
- [ ] Payment integration

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push branch: `git push origin feature-name`
5. Open Pull Request

## License

MIT License - feel free to use this project!

## Support

For issues or questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Include error messages and screenshots

---

**Built with ❤️ using MERN Stack**

Happy coding! 🚀
