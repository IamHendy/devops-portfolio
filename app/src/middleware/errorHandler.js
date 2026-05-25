'use strict';

const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  console.error(JSON.stringify({
    level:     'error',
    message:   err.message,
    stack:     err.stack,
    path:      req.path,
    method:    req.method,
    timestamp: new Date().toISOString(),
  }));

  res.status(err.status || 500).json({
    error: isProd ? 'Internal server error' : err.message,
  });
};

module.exports = { errorHandler };