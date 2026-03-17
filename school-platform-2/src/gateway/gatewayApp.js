const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const { env } = require("../config/env");
const { httpLogger } = require("../middleware/httpLogger");
const { errorHandler } = require("../middleware/errorHandler");
const { notFoundHandler } = require("../middleware/notFoundHandler");
const { gatewayAuth } = require("./middleware/gatewayAuth");
const { rateLimit } = require("./middleware/rateLimit");
const { correlationId } = require("./middleware/correlationId");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(correlationId);
app.use(httpLogger);

// Global rate limit (IP + user when available)
app.use(rateLimit());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "api-gateway" }));

// /auth is typically public (register/login/refresh)
app.use(
  "/auth",
  createProxyMiddleware({
    target: env.AUTH_SERVICE_URL,
    changeOrigin: true,
    xfwd: true,
    // NOTE: Express strips the mount path (/auth) from req.url before it
    // reaches this middleware. We prepend it back so the Auth service
    // receives /auth/* routes as expected.
    pathRewrite: (path) => `/auth${path}`,
    onProxyReq: (proxyReq, req) => {
      // Forward correlation id
      if (req.correlationId) proxyReq.setHeader("x-correlation-id", req.correlationId);
    },
  })
);

// Backward-compatible auth shortcuts (if clients call /login directly)
// Express strips the mount path, so each shortcut rewrites to a fixed auth route.
app.use(
  "/login",
  createProxyMiddleware({
    target: env.AUTH_SERVICE_URL,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: () => "/auth/login",
    onProxyReq: (proxyReq, req) => {
      if (req.correlationId) proxyReq.setHeader("x-correlation-id", req.correlationId);
    },
  })
);

app.use(
  "/register",
  createProxyMiddleware({
    target: env.AUTH_SERVICE_URL,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: () => "/auth/register",
    onProxyReq: (proxyReq, req) => {
      if (req.correlationId) proxyReq.setHeader("x-correlation-id", req.correlationId);
    },
  })
);

app.use(
  "/refresh",
  createProxyMiddleware({
    target: env.AUTH_SERVICE_URL,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: () => "/auth/refresh",
    onProxyReq: (proxyReq, req) => {
      if (req.correlationId) proxyReq.setHeader("x-correlation-id", req.correlationId);
    },
  })
);

// Protected routes: JWT validation at gateway
app.use("/students", gatewayAuth, proxyTo(env.STUDENT_SERVICE_URL, "/students"));
app.use("/courses", gatewayAuth, proxyTo(env.COURSE_SERVICE_URL, "/courses"));
app.use("/notifications", gatewayAuth, proxyTo(env.NOTIFICATION_SERVICE_URL, "/notifications"));

app.use(notFoundHandler);
app.use(errorHandler);

function proxyTo(target, mountPath) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    // Same mount-path stripping behavior as above.
    pathRewrite: (path) => `${mountPath}${path}`,
    onProxyReq: (proxyReq, req) => {
      if (req.correlationId) proxyReq.setHeader("x-correlation-id", req.correlationId);
      if (req.user?.id) proxyReq.setHeader("x-auth-user-id", req.user.id);
      if (req.user?.roles) proxyReq.setHeader("x-auth-roles", JSON.stringify(req.user.roles));
    },
  });
}

module.exports = app;

