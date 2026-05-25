'use strict';

const express = require('express');
const config  = require('../config/env');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler }  = require('./middleware/errorHandler');
const userRoutes        = require('./routes/users');

const app = express();

// Security: don't tell clients what framework we're using
app.disable('x-powered-by');

// Trust the Nginx proxy's headers
app.set('trust proxy', 1);

// Parse incoming JSON request bodies
app.use(express.json());

// CORS headers — who is allowed to call this API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  config.cors.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Log every request
app.use(requestLogger);

// Health endpoint — Docker and load balancers check this to know the app is alive
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
    version:   config.app.version,
  });
});

// All user routes live under /api/v1/users
app.use('/api/v1/users', userRoutes);

// 404 — catches any request that didn't match a route above
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;