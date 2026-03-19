## Apollo GraphQL (Federation-ready)

This project uses Apollo Server with `@apollo/subgraph` so each service can own its schema and be composed by a future Apollo Router / Gateway.

### Pattern per service
- `src/modules/<service>/<service>.graphql.js`
  - exports `{ <service>TypeDefs, <service>Resolvers }`
  - uses federation directives (`@link`, `@key`) for entity support

### Running
- GraphQL endpoint: `POST /graphql`

