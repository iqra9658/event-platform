const http = require('http');

function testAuth() {
  const data = JSON.stringify({
    name: 'Moin Test',
    email: `moin${Date.now()}@test.com`,
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('\n✅ REGISTER SUCCESS!\n');
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    });
  });

  req.on('error', err => {
    console.error('\n❌ ERROR:', err.message);
  });

  req.write(data);
  req.end();
}

setTimeout(testAuth, 1000);
