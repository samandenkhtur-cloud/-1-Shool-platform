const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const { env } = require("./config/env");

function registerSwagger(app) {
  const spec = swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: env.SWAGGER_TITLE,
        version: env.SWAGGER_VERSION,
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: ["./src/**/*.routes.js", "./src/**/*.routes.ts", "./src/**/*.js"],
  });

  app.get("/docs.json", (_req, res) => res.json(spec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
}

module.exports = { registerSwagger };

