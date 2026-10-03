const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const storeOwnerRoutes = require('./routes/storeOwnerRoutes');
const { sendError, sendSuccess } = require('./utils/responseHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'Roxiler Store Rating API service is up and running.');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/store-owner', storeOwnerRoutes);

// 404 Route Not Found Handler
app.use((req, res, next) => {
  return sendError(res, 404, `Route not found: ${req.originalUrl}`);
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  return sendError(res, err.status || 500, err.message || 'Internal Server Error');
});

module.exports = app;
