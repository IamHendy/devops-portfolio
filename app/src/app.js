'use strict';

const express = require('express');
const path    = require('path');
const config  = require('../config/env');
const { requestLogger }          = require('./middleware/requestLogger');
const { errorHandler }           = require('./middleware/errorHandler');
const { register, metricsMiddleware } = require('./metrics');
const userRoutes                 = require('./routes/users');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  config.cors.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(requestLogger);

// Metrics middleware — tracks every request
app.use(metricsMiddleware);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
    version:   config.app.version,
  });
});

// Metrics endpoint — Prometheus scrapes this every 15s
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API routes
app.use('/api/v1/users', userRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.use(errorHandler);

module.exports = app;