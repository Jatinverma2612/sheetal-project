import logger from "../utils/logger.js";
import { config } from "../config/config.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // winston logging
  logger.error("Request failed", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user._id : "Guest",
  });

  // cast error
  if (err.name === "CastError") {
    message = `Resource not found. Invalid ID format at: ${err.path}`;
    statusCode = 400;
  }

  // mongoose duplicate key error (Email, SKU, etc.)
  if (err.code === 11000) {
    const field = err.keyValue
      ? Object.keys(err.keyValue).join(", ")
      : err.keyPattern
        ? Object.keys(err.keyPattern).join(", ")
        : "Field";
    message = `${field} already exists. Please use another value.`;
    statusCode = 400;
  }

  // wrong JWT error
  if (err.name === "JsonWebTokenError") {
    message = "Json Web Token is invalid. Please login again!";
    statusCode = 401;
  }

  // JWT expire error
  if (err.name === "TokenExpiredError") {
    message = "Your session has expired. Please login again!";
    statusCode = 401;
  }

  // Multer upload error (file too large, unexpected field, etc.)
  if (err.name === "MulterError") {
    statusCode = 400;
    message = err.message || "File upload failed. Please verify file format and size.";
  }

  // validation Error
  if (err.name === "ValidationError") {
    const friendlyFieldNames = {
      "mainImage.url": "Main product image",
      mainImage: "Main product image",
      hoverImage: "Hover image",
      description: "Product description",
      materialCare: "Material and Care instructions",
      name: "Product name",
      slug: "Product slug",
      sku: "SKU code",
      category: "Product category",
      price: "Price",
      title: "Title",
    };

    message = err.errors
      ? Object.values(err.errors)
          .map((val) => {
            let msg = val.message || "";
            // Replace raw technical Mongoose path messages if any slip through
            if (msg.startsWith("Path `") && msg.endsWith("` is required.")) {
              const fieldName = msg
                .replace("Path `", "")
                .replace("` is required.", "");
              const friendlyName = friendlyFieldNames[fieldName] || fieldName;
              return `${friendlyName} is required.`;
            }
            return msg;
          })
          .filter(Boolean)
          .join(", ")
      : err.message || "Validation Error";
    statusCode = 400;
  }

  // final response
  res.status(statusCode).json({
    success: false,
    message: message,
    stack: config.mode === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
