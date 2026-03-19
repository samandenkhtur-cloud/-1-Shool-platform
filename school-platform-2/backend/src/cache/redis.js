const { createClient } = require("redis");
const { env } = require("../config/env");
const { logger } = require("../utils/logger");

let client;
let connectPromise;

function getRedis() {
  if (!client) {
    client = createClient({ url: env.REDIS_URL });
    client.on("error", (err) => logger.error("Redis error", { message: err.message }));
  }

  if (!connectPromise) {
    connectPromise = client.connect().catch((e) => {
      connectPromise = undefined;
      throw e;
    });
  }

  return { client, ready: connectPromise };
}

async function cacheGet(key) {
  const { client, ready } = getRedis();
  await ready;
  return client.get(key);
}

async function cacheSetJson(key, value, ttlSeconds) {
  const { client, ready } = getRedis();
  await ready;
  const payload = JSON.stringify(value);
  if (ttlSeconds) {
    await client.set(key, payload, { EX: ttlSeconds });
  } else {
    await client.set(key, payload);
  }
}

async function cacheDel(key) {
  const { client, ready } = getRedis();
  await ready;
  await client.del(key);
}

async function cacheDelByPrefix(prefix) {
  const { client, ready } = getRedis();
  await ready;

  let cursor = "0";
  do {
    const reply = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 200 });
    cursor = reply.cursor;
    const keys = reply.keys;
    if (keys.length) await client.del(keys);
  } while (cursor !== "0");
}

module.exports = { getRedis, cacheGet, cacheSetJson, cacheDel, cacheDelByPrefix };

