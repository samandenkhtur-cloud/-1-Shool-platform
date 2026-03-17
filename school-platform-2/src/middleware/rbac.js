const { AppError } = require("../errors/AppError");

/**
 * Simple RBAC middleware.
 * Usage:
 * - requireRoles("ADMIN")
 * - requirePermissions("student:create", "student:read:any")
 *
 * This expects `req.user` set by `authJwt`.
 */
function requireRoles(...requiredRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized("Not authenticated"));
    const has = requiredRoles.some((r) => req.user.roles.includes(r));
    if (!has) return next(AppError.forbidden("Missing required role(s)", { requiredRoles }));
    return next();
  };
}

function requirePermissions(...requiredPerms) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized("Not authenticated"));
    const has = requiredPerms.every((p) => req.user.permissions.includes(p));
    if (!has) return next(AppError.forbidden("Missing required permission(s)", { requiredPerms }));
    return next();
  };
}

module.exports = { requireRoles, requirePermissions };

