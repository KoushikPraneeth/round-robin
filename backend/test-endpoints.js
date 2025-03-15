require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Start test server
const testPort = 5002;
app.listen(testPort, () => {
  console.log(`Test server running on port ${testPort}`);
  console.log(`Try accessing: http://localhost:${testPort}/test`);
});
