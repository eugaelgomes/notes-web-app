const errorHandler = {
  // not found handler
  notFoundHandler: (req, res, next) => {
    const err = new Error(`Route "${req.originalUrl}" not found`);
    err.statusCode = 404;
    next(err);
  },

  // Global error handler
  globalErrorHandler: (err, req, res, next) => {
    // Only log if not 404 and in development
    if (process.env.NODE_ENV === "development" || err.statusCode >= 500) {
      console.error(err.stack || err);
    }

    res.status(err.statusCode || 500).json({
      error: {
        message: err.message || "Internal Server Error",
        status: err.statusCode || 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
      },
    });
  },
};

module.exports = { errorHandler };
