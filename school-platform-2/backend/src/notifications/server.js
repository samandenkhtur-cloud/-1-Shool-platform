const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { env } = require("../config/env");
const { httpLogger } = require("../middleware/httpLogger");
const { notFoundHandler } = require("../middleware/notFoundHandler");
const { errorHandler } = require("../middleware/errorHandler");
const { notificationRouter } = require("./notification.routes");
const { startNotificationWorker } = require("../workers/notificationWorker");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "notification-service" }));
app.use("/notifications", notificationRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Notification service listening on :${env.PORT}`);
});

if (env.NOTIFICATION_WORKER_ENABLED) {
  startNotificationWorker().catch((e) => {
    // eslint-disable-next-line no-console
    console.error("Notification worker failed", e?.message);
  });
}
