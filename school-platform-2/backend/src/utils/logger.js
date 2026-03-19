const winston = require("winston");

const { combine, timestamp, errors, json } = winston.format;

/**
 * Winston logger (JSON logs).
 * Keeps the existing `logger.info|warn|error(message, meta)` API used across the codebase.
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [new winston.transports.Console()],
});

function toMeta(meta) {
  if (!meta) return undefined;
  if (meta instanceof Error) return { error: { message: meta.message, stack: meta.stack } };
  return meta;
}

// Backward-compatible helpers that map to Winston.
const api = {
  info: (message, meta) => logger.info(message, toMeta(meta)),
  warn: (message, meta) => logger.warn(message, toMeta(meta)),
  error: (message, meta) => logger.error(message, toMeta(meta)),
  debug: (message, meta) => logger.debug(message, toMeta(meta)),
};

module.exports = { logger: api };

