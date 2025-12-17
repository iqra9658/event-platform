const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`📨 ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(5000, '127.0.0.1', () => {
  console.log('🚀 Minimal server on http://127.0.0.1:5000');
});

server.on('error', (err) => {
  console.error('💥 Server error:', err);
});
