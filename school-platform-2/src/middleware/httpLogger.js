const morgan = require("morgan");
const { logger } = require("../utils/logger");

const httpLogger = morgan("combined", {
  stream: {
    write: (message) => logger.info("HTTP_ACCESS", { line: message.trim() }),
  },
});

module.exports = { httpLogger };

