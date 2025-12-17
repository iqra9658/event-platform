/**
 * SIMPLE TEST - Just test auth first
 */

const axios = require('axios');

async function test() {
  try {
    console.log('\n🧪 Testing Auth Register...\n');
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('✅ SUCCESS!');
    console.log('Token:', res.data.token.substring(0, 20) + '...');
    console.log('User:', res.data.user);
  } catch (err) {
    console.log('❌ ERROR');
    console.log('Status:', err.response?.status);
    console.log('Data:', err.response?.data);
    console.log('Message:', err.message);
  }
}

setTimeout(test, 1000);
