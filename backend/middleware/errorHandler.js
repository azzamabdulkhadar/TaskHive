/**
 * Global error handling middleware.
 * Catches any error passed via next(err) from controllers.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} :: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: err.code || "SERVER_ERROR",
    },
    data: null,
  });
};

module.exports = { errorHandler };
