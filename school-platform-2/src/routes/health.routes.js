const express = require("express");

const healthRouter = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

module.exports = { healthRouter };

