const http = require('http');

const data = JSON.stringify({
  name: 'TestUser123',
  email: `moin${Date.now()}@gmail.com`,
  password: 'password123'
});

console.log('📤 Sending request to http://localhost:5000/api/auth/register');
console.log('📄 Payload:', data);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`\n📥 Response Status: ${res.statusCode}`);
  console.log('📋 Headers:', res.headers);
  
  let body = '';
  res.on('data', chunk => {
    body += chunk;
    process.stdout.write('.');
  });
  
  res.on('end', () => {
    console.log('\n\n✅ RESPONSE BODY:');
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (e) {
      console.log(body);
    }
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('\n❌ REQUEST ERROR:', err.message);
  process.exit(1);
});

console.log('\n⏳ Waiting for response...\n');
req.write(data);
req.end();

// Timeout after 5 seconds
setTimeout(() => {
  console.error('\n❌ TIMEOUT: No response after 5 seconds');
  process.exit(1);
}, 5000);
