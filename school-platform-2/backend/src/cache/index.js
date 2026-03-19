const { getRedis, cacheGet, cacheSetJson, cacheDel, cacheDelByPrefix } = require("./redis");

/**
 * Cache TTL strategy (defaults):
 * - List endpoints: short TTL (e.g. 30–60s)
 * - Detail endpoints: short TTL (e.g. 60s) + explicit invalidation on writes
 * - Always invalidate on create/update/delete for the affected keys/prefixes
 */

module.exports = {
  // client + primitives
  getRedis,
  cacheGet,
  cacheSetJson,
  cacheDel,
  cacheDelByPrefix,
};

