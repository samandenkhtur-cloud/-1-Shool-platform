const crypto = require("crypto");

function correlationId(req, res, next) {
  const incoming = req.headers["x-correlation-id"];
  const id = typeof incoming === "string" && incoming.length ? incoming : crypto.randomUUID();
  req.correlationId = id;
  res.setHeader("x-correlation-id", id);
  next();
}

module.exports = { correlationId };

