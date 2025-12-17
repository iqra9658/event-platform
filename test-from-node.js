const http = require('http');

console.log('🧪 Testing http://localhost:5000/api/auth/register');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Response status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('📦 Response body:', data);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message, err.code);
  console.error('Stack:', err.stack);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('⏱️ Request timeout');
  req.destroy();
  process.exit(1);
});

const postData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
});

console.log('📤 Sending POST:', postData);
req.write(postData);
req.end();
