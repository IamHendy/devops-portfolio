'use strict';

const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Requests currently being processed',
  registers: [register],
});

const metricsMiddleware = (req, res, next) => {
  if (req.path === '/metrics') return next();
  const end = httpRequestDuration.startTimer({
    method: req.method,
    route: req.route?.path ?? req.path,
  });
  httpRequestsInFlight.inc();
  res.on('finish', () => {
    const labels = {
      method:      req.method,
      route:       req.route?.path ?? req.path,
      status_code: res.statusCode,
    };
    httpRequestsTotal.inc(labels);
    end(labels);
    httpRequestsInFlight.dec();
  });
  next();
};

module.exports = { register, metricsMiddleware };