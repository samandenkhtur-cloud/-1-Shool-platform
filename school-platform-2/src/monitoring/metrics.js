const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
});
register.registerMetric(httpRequestDurationMs);

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    const route = req.route?.path || req.path || "unknown";
    httpRequestDurationMs
      .labels(req.method, route, String(res.statusCode))
      .observe(ms);
  });

  next();
}

async function metricsHandler(_req, res) {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
}

module.exports = { metricsMiddleware, metricsHandler, register };

