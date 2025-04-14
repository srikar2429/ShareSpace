const errorHandler = (err, req, res, next) => {
  // Default values for error status and message
  const status = err.status || 500;

  let error = { ...err, message: err.message };

  // Handle specific Mongoose errors
  if (err.name === "CastError") {
    error.message = "Resource not found";
    error.status = 404;
  }

  // Send the custom error response
  res.status(error.status || status).json({
    status: error.status || status,
    message: error.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
