const { PrismaClient } = require("@prisma/client");
const { logger } = require("../utils/logger");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["warn", "error"]
      : ["error"],
});

prisma.$on("error", (e) => {
  logger.error("Prisma error", { message: e.message });
});

module.exports = { prisma };

