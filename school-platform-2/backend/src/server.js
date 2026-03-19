const { env } = require("./config/env");
const { logger } = require("./utils/logger");
const app = require("./app");

app.listen(env.PORT, () => {
  logger.info(`HTTP server listening on :${env.PORT} (${env.NODE_ENV})`);
});

