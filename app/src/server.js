'use strict';

const app    = require('./app');
const config = require('../config/env');

const server = app.listen(config.server.port, config.server.host, () => {
  console.log(JSON.stringify({
    level:     'info',
    message:   'Server started',
    port:      config.server.port,
    env:       config.server.env,
    timestamp: new Date().toISOString(),
  }));
});

// Graceful shutdown
// When Docker stops a container it sends SIGTERM first.
// This gives in-flight requests up to 10 seconds to finish
// before the process exits. Without this, active requests
// get cut off mid-response on every single deploy.
const shutdown = (signal) => {
  console.log(JSON.stringify({
    level: 'info', message: `${signal} received, shutting down gracefully`
  }));

  server.close(() => {
    console.log(JSON.stringify({ level: 'info', message: 'Server closed' }));
    process.exit(0);
  });

  setTimeout(() => {
    console.error(JSON.stringify({ level: 'error', message: 'Forced exit after timeout' }));
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error(JSON.stringify({
    level: 'error', message: 'Unhandled promise rejection', reason: String(reason)
  }));
  process.exit(1);
});