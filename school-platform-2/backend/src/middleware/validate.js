const { AppError } = require("../errors/AppError");

/**
 * DTO validation middleware for Zod schemas.
 * - validate({ body: schema })
 * - validate({ params: schema, query: schema })
 */
function validate({ body, params, query }) {
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (params) req.params = params.parse(req.params);
      if (query) req.query = query.parse(req.query);
      next();
    } catch (e) {
      next(AppError.badRequest("Validation error", e?.issues ?? e));
    }
  };
}

module.exports = { validate };

