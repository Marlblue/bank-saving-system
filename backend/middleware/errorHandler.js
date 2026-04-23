/**
 * Global error handling middleware
 * Catches all unhandled errors and returns a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Custom application errors (thrown with status)
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      error: err.message
    });
  }

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      success: false,
      error: 'A database constraint was violated. This may be a duplicate entry.'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred. Please try again.'
  });
};

module.exports = errorHandler;
