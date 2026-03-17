const { env } = require("../config/env");
const { logger } = require("../utils/logger");
const { connectRabbit } = require("./rabbitmq");

function delayMs(attempt) {
  // exponential backoff with cap ~60s
  const base = env.RABBITMQ_RETRY_BASE_DELAY_MS;
  const ms = Math.min(base * Math.pow(2, Math.max(0, attempt - 1)), 60_000);
  return ms;
}

function queueNames(queueName) {
  return {
    main: queueName,
    retry: `${queueName}.retry`,
    dlq: `${queueName}.dlq`,
  };
}

/**
 * Creates a durable queue + retry queue + dlq.
 * - Main queue: {queueName}
 * - Retry queue: {queueName}.retry (per-message TTL via `expiration`, DLX back to main queue)
 * - DLQ: {queueName}.dlq
 */
async function assertConsumerTopology(ch, queueName, routingKeys) {
  const q = queueNames(queueName);
  // Main queue dead-letters to its DLQ when we reject without requeue.
  await ch.assertQueue(q.main, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": q.dlq,
    },
  });
  await ch.assertQueue(q.dlq, { durable: true });

  // Retry queue: messages expire then go back to main queue.
  await ch.assertQueue(q.retry, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": q.main,
    },
  });

  for (const key of routingKeys) {
    await ch.bindQueue(q.main, env.RABBITMQ_EXCHANGE, key);
  }
}

/**
 * Consumes JSON messages with retry + DLQ.
 * Handler signature: async (payload, meta) => void
 */
async function consumeJson({ queueName, routingKeys, handler }) {
  const ch = await connectRabbit();
  await ch.prefetch(env.RABBITMQ_PREFETCH);

  await assertConsumerTopology(ch, queueName, routingKeys);

  logger.info("Consumer ready", { queueName, routingKeys });

  const q = queueNames(queueName);

  await ch.consume(
    q.main,
    async (msg) => {
      if (!msg) return;

      const raw = msg.content.toString("utf8");
      const headers = msg.properties.headers || {};
      const attempt = Number(headers["x-retry-count"] || 0);
      const messageId = msg.properties.messageId;
      const routingKey = msg.fields.routingKey;

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        logger.error("Invalid JSON; sending to DLQ", { queueName, routingKey, messageId, raw });
        ch.sendToQueue(q.dlq, msg.content, {
          contentType: msg.properties.contentType,
          messageId,
          headers: { ...headers, "x-dlq-reason": "invalid_json" },
          persistent: true,
        });
        ch.ack(msg);
        return;
      }

      try {
        await handler(payload, {
          queueName,
          routingKey,
          messageId,
          attempt,
          headers,
        });
        ch.ack(msg);
      } catch (e) {
        const nextAttempt = attempt + 1;
        const max = env.RABBITMQ_MAX_RETRIES;

        logger.warn("Handler failed", {
          queueName,
          routingKey,
          messageId,
          attempt: nextAttempt,
          maxRetries: max,
          error: e?.message,
        });

        if (nextAttempt > max) {
          ch.sendToQueue(q.dlq, Buffer.from(raw), {
            contentType: "application/json",
            messageId,
            headers: { ...headers, "x-retry-count": nextAttempt, "x-dlq-reason": "max_retries_exceeded" },
            persistent: true,
          });
          ch.ack(msg);
          return;
        }

        const wait = delayMs(nextAttempt);
        ch.sendToQueue(q.retry, Buffer.from(raw), {
          contentType: "application/json",
          messageId,
          headers: { ...headers, "x-retry-count": nextAttempt },
          expiration: String(wait),
          persistent: true,
        });
        ch.ack(msg);
      }
    },
    { noAck: false }
  );
}

module.exports = { consumeJson, assertConsumerTopology, queueNames };

