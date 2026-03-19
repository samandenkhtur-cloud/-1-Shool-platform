const { Prisma } = require("@prisma/client");
const { AppError } = require("../errors/AppError");
const { logger } = require("../utils/logger");

function toResponse(err) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: {
        error: {
          code: err.code,
          message: err.message,
          details: err.details ?? undefined,
        },
      },
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        statusCode: 409,
        body: { error: { code: "CONFLICT", message: "Unique constraint failed", details: err.meta } },
      };
    }
    return {
      statusCode: 400,
      body: { error: { code: "PRISMA_ERROR", message: err.message, details: { code: err.code } } },
    };
  }

  return {
    statusCode: 500,
    body: { error: { code: "INTERNAL_ERROR", message: "Unexpected error" } },
  };
}

function errorHandler(err, req, res, _next) {
  const { statusCode, body } = toResponse(err);

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorName: err?.name,
    message: err?.message,
  });

  res.status(statusCode).json(body);
}

module.exports = { errorHandler };

