const crypto = require("crypto");
const { getRedis } = require("../cache/redis");
const { env } = require("../config/env");

const LIST_KEY = "notifications:list";

function buildNotification({ type, message, data }) {
  return {
    id: crypto.randomUUID(),
    type,
    message,
    data: data ?? null,
    createdAt: new Date().toISOString(),
  };
}

async function addNotification(notification) {
  const { client, ready } = getRedis();
  await ready;
  await client.lPush(LIST_KEY, JSON.stringify(notification));
  await client.lTrim(LIST_KEY, 0, env.NOTIFICATION_MAX_ITEMS - 1);
}

async function listNotifications(limit = 20) {
  const { client, ready } = getRedis();
  await ready;
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 200));
  const [itemsRaw, total] = await Promise.all([
    client.lRange(LIST_KEY, 0, safeLimit - 1),
    client.lLen(LIST_KEY),
  ]);
  const items = itemsRaw.map((raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }).filter(Boolean);
  return { items, total };
}

module.exports = { buildNotification, addNotification, listNotifications };
