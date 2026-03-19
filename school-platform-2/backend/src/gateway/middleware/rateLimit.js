const { env } = require("../../config/env");
const { cacheGet, cacheSetJson } = require("../../cache/redis");

function windowKey(nowMs) {
  const windowMs = env.RATE_LIMIT_WINDOW_SECONDS * 1000;
  return Math.floor(nowMs / windowMs);
}

function idFromReq(req) {
  // Prefer authenticated user, otherwise IP.
  const userId = req.user?.id;
  if (userId) return `u:${userId}`;
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  return `ip:${ip}`;
}

/**
 * Redis-backed fixed-window rate limiting.
 * Stores: { count, resetAt } as JSON.
 */
function rateLimit({ maxRequests, windowSeconds } = {}) {
  const max = maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS;
  const windowS = windowSeconds ?? env.RATE_LIMIT_WINDOW_SECONDS;

  return async (req, res, next) => {
    try {
      const now = Date.now();
      const win = windowKey(now);
      const id = idFromReq(req);
      const key = `rl:${id}:${win}`;
      const ttl = windowS;

      const existing = await cacheGet(key);
      let state;
      if (existing) {
        state = JSON.parse(existing);
        state.count += 1;
      } else {
        const resetAt = (win + 1) * windowS * 1000;
        state = { count: 1, resetAt };
      }

      await cacheSetJson(key, state, ttl);

      res.setHeader("x-ratelimit-limit", String(max));
      res.setHeader("x-ratelimit-remaining", String(Math.max(0, max - state.count)));
      res.setHeader("x-ratelimit-reset", String(Math.floor(state.resetAt / 1000)));

      if (state.count > max) {
        res.setHeader("retry-after", String(Math.max(1, Math.ceil((state.resetAt - now) / 1000))));
        return res.status(429).json({
          error: { code: "RATE_LIMITED", message: "Too many requests" },
        });
      }

      return next();
    } catch {
      // If Redis is down, fail open to avoid total outage.
      return next();
    }
  };
}

module.exports = { rateLimit };

