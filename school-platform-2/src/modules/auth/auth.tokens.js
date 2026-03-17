const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { env } = require("../../config/env");

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function signAccessToken(user) {
  return jwt.sign(
    {
      roles: [user.role],
      permissions: [],
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    }
  );
}

function signRefreshToken({ userId, refreshTokenId }) {
  return jwt.sign(
    {},
    env.JWT_REFRESH_SECRET,
    {
      subject: userId,
      jwtid: refreshTokenId,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    }
  );
}

function verifyRefreshToken(refreshToken) {
  return jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
}

module.exports = { sha256, signAccessToken, signRefreshToken, verifyRefreshToken };

