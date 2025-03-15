const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const crypto = require('crypto');
const authRoutes = require('./routes/auth');
const couponRoutes = require('./routes/coupons');
const historyRoutes = require('./routes/history');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Initialize express app
const app = express();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.options('*', cors());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
// Configure cookie parser with secret
const cookieSecret = process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex');
app.use(cookieParser(cookieSecret));

// Security middleware
app.use(helmet()); // Add basic security headers

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// Trust proxy for correct IP detection behind load balancer
app.set('trust proxy', 1);

// Routes with rate limiting
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/history', historyRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    error: process.env.NODE_ENV === 'production' 
      ? undefined 
      : err.stack
  });
});

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
