const { gql } = require("graphql-tag");
const { RegisterDto, LoginDto } = require("./auth.dto");
const { AuthService } = require("./auth.service");
const { AppError } = require("../../errors/AppError");

const authTypeDefs = gql`
  enum Role {
    ADMIN
    STUDENT
  }

  type User @key(fields: "id") {
    id: ID!
    email: String!
    role: Role!
    createdAt: String!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    role: Role
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
  }
`;

const authResolvers = {
  Query: {
    me: async (_parent, _args, ctx) => {
      if (!ctx.user) return null;
      // Minimal "me" projection; in real life you’d fetch from DB.
      return {
        id: ctx.user.id,
        email: "unknown",
        role: (ctx.user.roles?.[0] || "STUDENT").toString(),
        createdAt: new Date(0).toISOString(),
      };
    },
  },
  Mutation: {
    register: async (_parent, { input }) => {
      const dto = RegisterDto.parse(input);
      const svc = new AuthService();
      const result = await svc.register(dto);
      return {
        ...result,
        user: { ...result.user, createdAt: new Date(result.user.createdAt).toISOString() },
      };
    },
    login: async (_parent, { input }) => {
      const dto = LoginDto.parse(input);
      const svc = new AuthService();
      const result = await svc.login(dto);
      return {
        ...result,
        user: { ...result.user, createdAt: new Date(result.user.createdAt).toISOString() },
      };
    },
  },
  User: {
    __resolveReference: async (ref) => {
      // Federation-ready hook: resolve user entities if/when you need it.
      // Keeping minimal to avoid DB reads here.
      if (!ref?.id) throw AppError.badRequest("User reference missing id");
      return { id: ref.id, email: ref.email ?? "unknown", role: ref.role ?? "STUDENT", createdAt: ref.createdAt ?? new Date(0).toISOString() };
    },
  },
};

module.exports = { authTypeDefs, authResolvers };

