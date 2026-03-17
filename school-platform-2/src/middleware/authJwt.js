const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { AppError } = require("../errors/AppError");

/**
 * Attaches `req.user` if token is valid.
 * Expected JWT claims:
 * - sub: userId
 * - roles: string[]
 * - permissions: string[] (optional)
 * - tenantId: string (optional)
 */
function authJwt(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing Bearer token"));
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    req.user = {
      id: payload.sub,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      tenantId: payload.tenantId,
    };

    return next();
  } catch (e) {
    return next(AppError.unauthorized("Invalid or expired token", { message: e.message }));
  }
}

module.exports = { authJwt };

