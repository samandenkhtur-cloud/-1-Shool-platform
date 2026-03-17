class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} code
   * @param {unknown} details
   */
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message = "Bad Request", details) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized", details) {
    return new AppError(message, 401, "UNAUTHORIZED", details);
  }

  static forbidden(message = "Forbidden", details) {
    return new AppError(message, 403, "FORBIDDEN", details);
  }

  static notFound(message = "Not Found", details) {
    return new AppError(message, 404, "NOT_FOUND", details);
  }

  static conflict(message = "Conflict", details) {
    return new AppError(message, 409, "CONFLICT", details);
  }
}

module.exports = { AppError };

