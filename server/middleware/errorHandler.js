/**
 * Centralized error handling.
 *
 * Clients ALWAYS receive generic, safe messages — never stack traces, internal
 * file paths, or raw database/third-party error details. Full error details are
 * logged server-side for debugging.
 */

const JWT_ERROR_NAMES = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"];

// Map an unexpected error to a safe status code + generic client message.
const mapError = (err) => {
  // Body parser: malformed/invalid JSON payload
  if (err.type === "entity.parse.failed") {
    return { statusCode: 400, message: "Invalid JSON in request body" };
  }

  // Node/Express errors explicitly marked safe to expose (e.g. payload too large,
  // unsupported content type). Their messages contain no internals.
  if (err.expose === true && typeof err.message === "string") {
    return { statusCode: err.status || err.statusCode || 400, message: err.message };
  }

  // Mongoose schema validation errors
  if (err.name === "ValidationError") {
    return { statusCode: 400, message: "Invalid data provided" };
  }

  // Mongoose cast errors (malformed ObjectId, wrong type in query, etc.)
  if (err.name === "CastError") {
    return { statusCode: 400, message: "Invalid request parameters" };
  }

  // MongoDB duplicate key violations
  if (err.code === 11000) {
    return { statusCode: 409, message: "A resource with that identifier already exists" };
  }

  // JWT verification failures
  if (JWT_ERROR_NAMES.includes(err.name)) {
    return { statusCode: 401, message: "Not authorized" };
  }

  // Everything else — never reveal internals to the client
  return { statusCode: 500, message: "Internal server error" };
};

// 404 handler for unknown routes — generic message, no echoed paths
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
};

// Centralized error handler middleware (must keep 4 args for Express to treat it as such)
export const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  // A response may already be partially sent (e.g. streaming); let Express
  // close the connection rather than throwing "headers already sent".
  if (res.headersSent) {
    return next(err);
  }

  const { statusCode, message } = mapError(err);
  res.status(statusCode).json({ error: message });
};
