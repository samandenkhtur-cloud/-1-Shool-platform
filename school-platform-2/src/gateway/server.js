const { env } = require("../config/env");
const { logger } = require("../utils/logger");
const app = require("./gatewayApp");

app.listen(env.GATEWAY_PORT, () => {
  logger.info(`API Gateway listening on :${env.GATEWAY_PORT} (${env.NODE_ENV})`);
});

