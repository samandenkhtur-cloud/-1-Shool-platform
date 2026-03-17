const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { buildSubgraphSchema } = require("@apollo/subgraph");

const express = require("express");
const { logger } = require("../utils/logger");
const { buildContext } = require("./context");
const { baseTypeDefs } = require("./base.graphql");

const { authTypeDefs, authResolvers } = require("../modules/auth/auth.graphql");
const { studentTypeDefs, studentResolvers } = require("../modules/students/student.graphql");
const { courseTypeDefs, courseResolvers } = require("../modules/courses/course.graphql");

async function registerApollo(app) {
  const schema = buildSubgraphSchema([
    { typeDefs: baseTypeDefs },
    { typeDefs: authTypeDefs, resolvers: authResolvers },
    { typeDefs: studentTypeDefs, resolvers: studentResolvers },
    { typeDefs: courseTypeDefs, resolvers: courseResolvers },
  ]);

  const server = new ApolloServer({
    schema,
    formatError: (formattedError) => {
      // Keep errors clean; rely on service logs for details
      return formattedError;
    },
  });

  await server.start();

  // Ensure JSON parsing for GraphQL requests
  app.use("/graphql", express.json({ limit: "1mb" }));

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req),
    })
  );

  logger.info("Apollo GraphQL registered at /graphql");
}

module.exports = { registerApollo };

