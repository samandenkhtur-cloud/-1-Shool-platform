const express = require("express");
const { authJwt } = require("../middleware/authJwt");
const { asyncHandler } = require("../utils/asyncHandler");
const { listNotifications } = require("./notification.store");

const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  authJwt,
  asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const result = await listNotifications(limit);
    res.json(result);
  })
);

module.exports = { notificationRouter };
