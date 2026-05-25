'use strict';

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const log = {
      level: res.statusCode >= 500 ? 'error'
           : res.statusCode >= 400 ? 'warn'
           : 'info',
      method:      req.method,
      path:        req.path,
      status:      res.statusCode,
      duration_ms: Date.now() - startTime,
      ip:          req.ip,
      timestamp:   new Date().toISOString(),
    };
    console.log(JSON.stringify(log));
  });

  next();
};

module.exports = { requestLogger };