const { gql } = require("graphql-tag");

/**
 * Base GraphQL schema (federation-ready).
 * IMPORTANT: Include the federation @link exactly once.
 */
const baseTypeDefs = gql`
  schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.3"
      import: ["@key"]
    ) {
    query: Query
    mutation: Mutation
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

module.exports = { baseTypeDefs };

