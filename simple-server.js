const express = require('express');
const app = express();

console.log('📦 Express version:', require('express/package.json').version);

app.use(express.json());

// Logging middleware BEFORE routes
app.use((req, res, next) => {
  console.log(`📨 REQUEST: ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  try {
    console.log('🏥 Health endpoint called');
    res.json({ status: 'OK' });
  } catch (err) {
    console.error('Health route error:', err);
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    console.log('📝 Register endpoint called');
    res.json({ success: true, message: 'Test OK' });
  } catch (err) {
    console.error('Register route error:', err);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
});

const PORT = 5000;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Simple test server on ${PORT}`);
  console.log(`📍 Listening on http://127.0.0.1:${PORT}`);
  
  // Verify it's actually listening
  const addr = server.address();
  console.log(`✅ Server address: ${JSON.stringify(addr)}`);
});

server.on('error', (err) => {
  console.error('💥 Server error:', err);
});

setTimeout(() => {
  console.log('⏱️ Still running...');
}, 3000);

