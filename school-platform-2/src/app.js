const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { env } = require("./config/env");
const { httpLogger } = require("./middleware/httpLogger");
const { notFoundHandler } = require("./middleware/notFoundHandler");
const { errorHandler } = require("./middleware/errorHandler");
const { registerSwagger } = require("./swagger");
const { metricsMiddleware, metricsHandler } = require("./monitoring/metrics");

const { healthRouter } = require("./routes/health.routes");
const { authRouter } = require("./modules/auth/auth.routes");
const { studentRouter } = require("./modules/students/student.routes");
const { courseRouter } = require("./modules/courses/course.routes");
const { registerApollo } = require("./graphql/apollo");

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
if (env.ENABLE_METRICS) app.use(metricsMiddleware);
app.use(httpLogger);

registerSwagger(app);
registerApollo(app);

app.use("/health", healthRouter);
if (env.ENABLE_METRICS) app.get(env.METRICS_PATH, metricsHandler);
app.use("/auth", authRouter);
app.use("/students", studentRouter);
app.use("/courses", courseRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

