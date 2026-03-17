const { env } = require("../../config/env");
const { cacheGet, cacheSetJson } = require("../redis");
const { buildGetKey } = require("../cacheKeys");

/**
 * Middleware-based caching for GET responses.
 *
 * - **Key strategy**: default `namespace:get:<path>:<stableSortedQueryJson>`
 * - **TTL**: default `env.CACHE_TTL_SECONDS`
 * - **Bypass**: set `req.headers["x-cache-bypass"]=1` to bypass cache
 *
 * Options:
 * - namespace: string (recommended per module, e.g. "students")
 * - keyBuilder: (req) => string
 * - ttlSeconds: number
 */
function cacheResponse({ namespace, keyBuilder, ttlSeconds } = {}) {
  const ttl = ttlSeconds ?? env.CACHE_TTL_SECONDS;

  return async (req, res, next) => {
    if (req.headers["x-cache-bypass"] === "1") return next();

    try {
      const key =
        typeof keyBuilder === "function"
          ? keyBuilder(req)
          : buildGetKey({ namespace, path: req.path, query: req.query });

      const hit = await cacheGet(key);
      if (hit) {
        res.setHeader("x-cache", "HIT");
        return res.status(200).json(JSON.parse(hit));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        cacheSetJson(key, body, ttl).catch(() => {});
        res.setHeader("x-cache", "MISS");
        return originalJson(body);
      };

      return next();
    } catch {
      return next();
    }
  };
}

module.exports = { cacheResponse };

