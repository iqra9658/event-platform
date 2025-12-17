# MERN Event Platform - Working Guide

## Current Status: ✅ READY FOR TESTING

### Servers Running:
- **Backend**: http://localhost:5000 (Express + MongoDB)
- **Frontend**: http://localhost:3000 (React)

---

## Test Case 1: Registration Flow

**Step 1: Go to http://localhost:3000/register**
- Should show Registration form

**Step 2: Fill form with:**
- Email: `test@example.com`
- Password: `password123`
- Confirm Password: `password123`
- Click Register

**Expected Result:**
- ✅ Form should submit
- ✅ Page should redirect to Dashboard
- ✅ Navbar should show: "Dashboard", "Create Event", "Logout"
- ✅ Token saved in localStorage

**If page refreshes:**
- ✅ Should stay on Dashboard (token restored from localStorage)
- ✅ Should NOT go back to login

---

## Test Case 2: Login Flow

**Step 1: Click Logout button**
- Should redirect to Login page

**Step 2: Go to http://localhost:3000/login**
- Should show Login form

**Step 3: Fill with:**
- Email: `test@example.com`
- Password: `password123`
- Click Login

**Expected Result:**
- ✅ Should redirect to Dashboard
- ✅ Shows list of events (empty initially)

---

## Test Case 3: Create Event

**Step 1: On Dashboard, click "Create Event"**

**Step 2: Fill form:**
- Title: `Summer Concert`
- Description: `Live music event`
- Date: Pick any future date
- Location: `Central Park`
- Capacity: `5`
- Click Create

**Expected Result:**
- ✅ Redirect back to Dashboard
- ✅ Event appears in list with:
  - Title
  - Description
  - Location
  - Attendees: 0/5
  - Join button

---

## Test Case 4: RSVP (Single User)

**Step 1: On Dashboard, find the event you created**

**Step 2: Click "Join" button**

**Expected Result:**
- ✅ Button changes to "Leave"
- ✅ Attendees count changes from 0/5 to 1/5

**Step 3: Click "Leave" button**

**Expected Result:**
- ✅ Button changes to "Join"
- ✅ Attendees count goes back to 0/5

---

## Test Case 5: RSVP Concurrency (Critical Assignment Feature)

**Step 1: Create new event with capacity 1**

**Step 2: Open TWO browser windows/tabs side-by-side**
- Tab 1: http://localhost:3000
- Tab 2: http://localhost:3000

**Step 3: In Tab 1**
- Login with: test@example.com / password123
- Find the event with capacity 1

**Step 4: In Tab 2**
- Create NEW account (test2@example.com / password123)
- Find the same event

**Step 5: SIMULTANEOUSLY click "Join" in BOTH tabs**
- Spam click quickly in both tabs at exact same time

**Expected Result:**
- ✅ ONE person joins successfully (shows 1/1, button becomes Leave)
- ✅ OTHER person gets error: "Event is at full capacity"
- ✅ This proves MongoDB transactions work correctly

---

## Troubleshooting

### Page shows "Loading..." indefinitely
- Issue: AuthContext loading state stuck
- Fix: Refresh browser (F5)

### Can't register - says email already exists
- Register with different email: test2@example.com

### Can't login - says invalid credentials
- Make sure email and password match exactly
- Password is case-sensitive

### Dashboard is empty after login
- Events list starts empty
- Create an event first using "Create Event" button

---

## Backend Endpoints (for reference)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/events | ❌ | List events |
| POST | /api/events | ✅ | Create event |
| POST | /api/events/:id/join | ✅ | Join event |
| POST | /api/events/:id/leave | ✅ | Leave event |

---

## Database

**MongoDB Atlas Connection**: Active ✅
**Collections**:
- `users` - User accounts
- `events` - Events
- `rsvps` - Event RSVPs

---

**Status**: Ready for full testing
**Last Updated**: December 18, 2025

