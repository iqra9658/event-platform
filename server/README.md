# Event Platform - Backend Server

Express.js backend with MongoDB and JWT authentication.

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Server runs on `http://localhost:5000`

## Scripts

- `npm start` - Production mode
- `npm run dev` - Development with nodemon

## Database Models

### User
```javascript
{
  email: String (unique, required),
  password: String (hashed),
  name: String,
  createdAt: Date
}
```

### Event
```javascript
{
  title: String,
  description: String,
  date: Date,
  location: String,
  capacity: Number,
  currentAttendees: Number,
  imageUrl: String,
  creator: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### RSVP
```javascript
{
  userId: ObjectId (User),
  eventId: ObjectId (Event),
  joinedAt: Date
}
```

## Key Features

✅ JWT authentication with 7-day expiration
✅ bcryptjs password hashing
✅ MongoDB transactions for RSVP atomicity
✅ Input validation and error handling
✅ CORS enabled for frontend
✅ Base64 image storage

## API Structure

- `/api/auth` - Authentication routes
- `/api/events` - Event management routes

## Middleware

- **auth.js** - JWT token verification
- **upload.js** - Image file upload handling

## Environment Variables

See `.env.example` for required variables.
