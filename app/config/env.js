'use strict';

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key, defaultValue) => {
  return process.env[key] ?? defaultValue;
};

module.exports = {
  server: {
    port: parseInt(optional('PORT', '3000'), 10),
    host: optional('HOST', '0.0.0.0'),
    env:  optional('NODE_ENV', 'development'),
  },
  app: {
    name:    optional('APP_NAME', 'users-api'),
    version: optional('APP_VERSION', '1.0.0'),
  },
  cors: {
    origin: optional('CORS_ORIGIN', '*'),
  },
};