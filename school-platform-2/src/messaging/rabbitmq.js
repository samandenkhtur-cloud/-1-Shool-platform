const amqplib = require("amqplib");
const { env } = require("../config/env");
const { logger } = require("../utils/logger");

let conn;
let channel;
let connecting;

async function connectRabbit() {
  if (channel) return channel;
  if (connecting) return connecting;

  connecting = (async () => {
    conn = await amqplib.connect(env.RABBITMQ_URL);
    conn.on("error", (err) => logger.error("RabbitMQ connection error", { message: err.message }));
    conn.on("close", () => {
      logger.warn("RabbitMQ connection closed; reconnecting...");
      conn = undefined;
      channel = undefined;
      connecting = undefined;
      setTimeout(() => connectRabbit().catch(() => {}), 1000);
    });

    channel = await conn.createConfirmChannel();
    await channel.assertExchange(env.RABBITMQ_EXCHANGE, "topic", { durable: true });
    logger.info("RabbitMQ connected");
    return channel;
  })();

  return connecting;
}

async function publishEvent(routingKey, payload, options = {}) {
  const ch = await connectRabbit();
  const body = Buffer.from(JSON.stringify(payload));
  ch.publish(env.RABBITMQ_EXCHANGE, routingKey, body, {
    contentType: "application/json",
    persistent: true,
    timestamp: Date.now(),
    ...options,
  });
  await ch.waitForConfirms();
}

/**
 * Publisher utility: publishes JSON to topic exchange.
 * - routingKey: e.g. "student.created"
 * - payload: JSON-serializable
 * - options.messageId: recommended (idempotency)
 */
async function publishJson(routingKey, payload, options = {}) {
  return publishEvent(routingKey, payload, options);
}

module.exports = { connectRabbit, publishEvent, publishJson };

