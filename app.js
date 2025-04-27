//app.js

require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

// MongoDB Connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB successfully');
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  retryWrites: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Route imports
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const budgetRouter = require('./routes/budget');
const incomeRouter = require('./routes/income');
const reportRouter = require('./routes/report');
const expenseRouter = require('./routes/expense');

// Middleware setup
app.use(cors({
  origin: ['http://expensetrackerpersona.netlify.app', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Public routes (no auth)
app.use('/', indexRouter);
app.use('/api/users', usersRouter);

// ✅ Apply Auth Middleware BEFORE protected routes
app.use((req, res, next) => {
  const openPaths = [
    '/api/users/login',
    '/api/users/register',
    '/api/users/forgot-password',
    '/',
    '/api'
  ];

  if (
    openPaths.includes(req.path) ||
    req.method === 'OPTIONS' ||
    req.path.startsWith('/api/users') // allows all user-related unauth routes
  ) {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = { userId: decoded.userId }; // Make sure it’s "userId", not "id", to match expense code
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token verification failed, access denied' });
  }
});

// ✅ Protected Routes
app.use('/api/expense', expenseRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/income', incomeRouter);
app.use('/api/report', reportRouter);

// Test CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// 404 Handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error Handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
