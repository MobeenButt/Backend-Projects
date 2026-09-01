import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // Default status code and message
  let statusCode = 500;
  let message = "Internal Server Error";
  
  // Agar error already ApiError instance hai
  if (err instanceof ApiError) {
    statusCode = err.statusCode || 500;
    message = err.message;
    
    return res.status(statusCode).json({
      statusCode: statusCode,
      message: message,
      success: false,
      errors: err.errors || [],
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // Agar normal Error hai
  return res.status(statusCode).json({
    statusCode: statusCode,
    message: err.message || message,
    success: false,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorHandler };
