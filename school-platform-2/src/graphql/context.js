const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function tryGetUserFromBearer(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
    return {
      id: payload.sub,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      tenantId: payload.tenantId,
    };
  } catch {
    return null;
  }
}

async function buildContext(req) {
  return {
    user: tryGetUserFromBearer(req),
    correlationId: req.headers["x-correlation-id"],
  };
}

module.exports = { buildContext };

