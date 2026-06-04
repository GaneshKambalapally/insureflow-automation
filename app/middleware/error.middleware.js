/**
 * InsureFlow - Global Error Handler Middleware
 * Provides consistent error responses across all routes
 */
const { logger } = require('./logger.middleware');

/**
 * Global error handler - must be last middleware
 */
function errorHandler(err, req, res, next) {
  logger.error(`${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    code: err.code || 'SERVER_ERROR',
    ...(process.env.ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 Not Found handler
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND'
  });
}

module.exports = { errorHandler, notFound };
