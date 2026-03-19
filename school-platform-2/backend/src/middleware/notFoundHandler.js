const { AppError } = require("../errors/AppError");

function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { notFoundHandler };

