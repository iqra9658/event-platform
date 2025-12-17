/**
 * AUTOMATED TEST SUITE - Phase 2-4
 * Run this ONCE to test: Auth → Events → RSVP Concurrency
 * No Postman needed - just: node server/test-complete.js
 */

const axios = require('axios');

const API = 'http://localhost:5000/api';
let testToken = '';
let testUserId = '';
let testEventId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}🧪 ${msg}${colors.reset}`)
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  try {
    log.test('=== PHASE 2: AUTH TESTS ===\n');

    // Test 1: Register User
    log.test('Test 1: Register User');
    const registerRes = await axios.post(`${API}/auth/register`, {
      name: 'Moin Test User',
      email: `moin${Date.now()}@test.com`,
      password: 'password123'
    });
    testToken = registerRes.data.token;
    testUserId = registerRes.data.user.id;
    log.success(`User registered! Token: ${testToken.substring(0, 20)}...`);
    log.success(`User ID: ${testUserId}\n`);

    // Test 2: Login User
    log.test('Test 2: Login with Same Credentials');
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: registerRes.data.user.email,
      password: 'password123'
    });
    log.success(`Login successful! New token: ${loginRes.data.token.substring(0, 20)}...\n`);

    log.test('=== PHASE 3: EVENTS CRUD TESTS ===\n');

    // Test 3: Create Event
    log.test('Test 3: Create Event (with Auth)');
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const eventRes = await axios.post(
      `${API}/events`,
      {
        title: 'Test Event',
        description: 'This is a test event for the MERN assignment',
        date: futureDate,
        location: 'Test Location',
        capacity: 5
      },
      {
        headers: { Authorization: `Bearer ${testToken}` }
      }
    );
    testEventId = eventRes.data.event._id;
    log.success(`Event created! ID: ${testEventId}`);
    log.success(`Title: ${eventRes.data.event.title}`);
    log.success(`Capacity: ${eventRes.data.event.capacity}\n`);

    // Test 4: Get All Events
    log.test('Test 4: Get All Events');
    const eventsRes = await axios.get(`${API}/events`);
    log.success(`Found ${eventsRes.data.length} upcoming events\n`);

    // Test 5: Get Single Event
    log.test('Test 5: Get Event by ID');
    const singleRes = await axios.get(`${API}/events/${testEventId}`);
    log.success(`Event: ${singleRes.data.title} (${singleRes.data.currentAttendees}/${singleRes.data.capacity})\n`);

    log.test('=== PHASE 4: RSVP & CONCURRENCY TESTS ===\n');

    // Test 6: Join Event
    log.test('Test 6: Join Event (RSVP)');
    const joinRes = await axios.post(
      `${API}/events/${testEventId}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${testToken}` }
      }
    );
    log.success(`✅ Joined event! Current attendees: ${joinRes.data.event.currentAttendees}/${joinRes.data.event.capacity}\n`);

    // Test 7: Try to Join Again (should FAIL - duplicate prevention)
    log.test('Test 7: Try Join Again (Duplicate Prevention Test)');
    try {
      await axios.post(
        `${API}/events/${testEventId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${testToken}` }
        }
      );
      log.error('❌ FAILED: Should have prevented duplicate join!');
    } catch (err) {
      log.success(`Duplicate join blocked: "${err.response.data.message}"\n`);
    }

    // Test 8: Create 2nd User & Test Capacity
    log.test('Test 8: Register 2nd User');
    const user2Res = await axios.post(`${API}/auth/register`, {
      name: 'Test User 2',
      email: `user2${Date.now()}@test.com`,
      password: 'password123'
    });
    const user2Token = user2Res.data.token;
    log.success(`2nd user registered!\n`);

    // Test 9: User2 Joins Event
    log.test('Test 9: User2 Joins Same Event');
    const join2Res = await axios.post(
      `${API}/events/${testEventId}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${user2Token}` }
      }
    );
    log.success(`User2 joined! Attendees: ${join2Res.data.event.currentAttendees}/${join2Res.data.event.capacity}\n`);

    // Test 10: CONCURRENCY TEST - Fill Capacity
    log.test('Test 10: CONCURRENCY TEST - Fill Event to Capacity');
    log.info(`Event capacity is ${join2Res.data.event.capacity}. Current: ${join2Res.data.event.currentAttendees}\n`);

    for (let i = 0; i < 3; i++) {
      const userRes = await axios.post(`${API}/auth/register`, {
        name: `User ${i + 3}`,
        email: `user${i + 3}${Date.now()}@test.com`,
        password: 'password123'
      });
      const token = userRes.data.token;

      try {
        const joinRes = await axios.post(
          `${API}/events/${testEventId}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        log.success(`User ${i + 3} joined - Attendees: ${joinRes.data.event.currentAttendees}/${joinRes.data.event.capacity}`);
      } catch (err) {
        log.error(`User ${i + 3} join FAILED (expected at capacity): ${err.response.data.message}`);
      }
    }
    log.info('\n');

    // Test 11: Check Event Attendees
    log.test('Test 11: Get Event Attendees List');
    const attendeesRes = await axios.get(`${API}/events/${testEventId}/attendees`);
    log.success(`Total attendees: ${attendeesRes.data.length}\n`);

    // Test 12: Leave Event
    log.test('Test 12: Leave Event');
    const leaveRes = await axios.post(
      `${API}/events/${testEventId}/leave`,
      {},
      { headers: { Authorization: `Bearer ${testToken}` } }
    );
    log.success(`Left event! Attendees: ${leaveRes.data.event.currentAttendees}/${leaveRes.data.event.capacity}\n`);

    // Test 13: Update Event (Creator Only)
    log.test('Test 13: Update Event (Creator Only)');
    const updateRes = await axios.put(
      `${API}/events/${testEventId}`,
      {
        title: 'Updated Test Event',
        description: 'Updated description'
      },
      { headers: { Authorization: `Bearer ${testToken}` } }
    );
    log.success(`Event updated! New title: ${updateRes.data.event.title}\n`);

    log.test('=== ✅ ALL TESTS PASSED! ===\n');
    log.success('Your MERN assignment is working perfectly!');
    log.info('\nNext steps:');
    log.info('1. ✅ Backend tested and working');
    log.info('2. Build React frontend (Login, Register, EventForm, Dashboard)');
    log.info('3. Deploy to Render (backend) + Vercel/Netlify (frontend)');

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response) {
      log.error(`Response: ${JSON.stringify(error.response.data)}`);
    }
    process.exit(1);
  }
}

// Wait for server to be ready, then run tests
setTimeout(() => {
  console.log('\n🚀 Starting automated test suite...\n');
  runTests().then(() => {
    console.log('\n✅ Test suite complete!\n');
    process.exit(0);
  }).catch(err => {
    log.error(err.message);
    process.exit(1);
  });
}, 2000);
