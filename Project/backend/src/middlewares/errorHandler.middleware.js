import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in production, use proper logging service)
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    console.error("❌ Error:", err.message);
    console.error("Stack:", err.stack);
  } else {
    // In production, log to monitoring service (e.g., Sentry, LogRocket)
    console.error("❌ Error:", err.message);
  }
  
  // Default status code and message
  let statusCode = 500;
  let message = "Internal Server Error";
  
  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode || 500;
    message = err.message;
    
    return res.status(statusCode).json({
      statusCode: statusCode,
      message: message,
      success: false,
      errors: err.errors || [],
      // NEVER expose stack traces in production
      ...(isDevelopment && { stack: err.stack }),
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Generic error response
  return res.status(statusCode).json({
    statusCode: statusCode,
    message: message,
    success: false,
    // NEVER expose stack traces in production
    ...(isDevelopment && { stack: err.stack }),
  });
};

export { errorHandler };
