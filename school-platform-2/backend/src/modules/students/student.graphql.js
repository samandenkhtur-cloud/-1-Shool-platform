const { gql } = require("graphql-tag");
const { StudentCreateDto, StudentListQueryDto } = require("./student.dto");
const { StudentRepository } = require("./student.repository");
const { StudentService } = require("./student.service");
const { AppError } = require("../../errors/AppError");

const studentTypeDefs = gql`
  type Student @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    age: Int!
    createdAt: String!
  }

  type StudentPage {
    items: [Student!]!
    page: Int!
    pageSize: Int!
    total: Int!
    totalPages: Int!
  }

  input StudentListFilter {
    page: Int
    pageSize: Int
    q: String
    name: String
    email: String
    minAge: Int
    maxAge: Int
  }

  input CreateStudentInput {
    name: String!
    email: String!
    age: Int!
  }

  extend type Query {
    getStudents(filter: StudentListFilter): StudentPage!
  }

  extend type Mutation {
    createStudent(input: CreateStudentInput!): Student!
  }
`;

const studentResolvers = {
  Query: {
    getStudents: async (_parent, { filter }, ctx) => {
      if (!ctx.user) throw AppError.unauthorized("Unauthorized");
      const dto = StudentListQueryDto.parse(filter ?? {});
      const svc = new StudentService(new StudentRepository());
      const page = await svc.list(dto);
      return {
        ...page,
        items: page.items.map((s) => ({ ...s, createdAt: new Date(s.createdAt).toISOString() })),
      };
    },
  },
  Mutation: {
    createStudent: async (_parent, { input }, ctx) => {
      if (!ctx.user) throw AppError.unauthorized("Unauthorized");
      const dto = StudentCreateDto.parse(input);
      const svc = new StudentService(new StudentRepository());
      const s = await svc.create(dto);
      return { ...s, createdAt: new Date(s.createdAt).toISOString() };
    },
  },
  Student: {
    __resolveReference: async (ref) => {
      // Federation-ready entity resolver
      const svc = new StudentService(new StudentRepository());
      const s = await svc.getById(ref.id);
      return { ...s, createdAt: new Date(s.createdAt).toISOString() };
    },
  },
};

module.exports = { studentTypeDefs, studentResolvers };

