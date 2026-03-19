const { gql } = require("graphql-tag");
const { CourseService } = require("./course.service");
const { AppError } = require("../../errors/AppError");

const courseTypeDefs = gql`
  type Course @key(fields: "id") {
    id: ID!
    title: String!
    description: String
    enrollmentCount: Int!
  }

  type Enrollment {
    id: ID!
    studentId: String!
    courseId: String!
    createdAt: String!
  }

  input EnrollStudentInput {
    courseId: String!
    studentId: String!
  }

  extend type Query {
    courses: [Course!]!
  }

  extend type Mutation {
    enrollStudent(input: EnrollStudentInput!): Enrollment!
  }
`;

const courseResolvers = {
  Query: {
    courses: async (_parent, _args, ctx) => {
      if (!ctx.user) throw AppError.unauthorized("Unauthorized");
      const svc = new CourseService();
      return svc.list();
    },
  },
  Mutation: {
    enrollStudent: async (_parent, { input }, ctx) => {
      if (!ctx.user) throw AppError.unauthorized("Unauthorized");
      const svc = new CourseService();
      const enrollment = await svc.enrollStudent(input.courseId, input.studentId);
      return { ...enrollment, createdAt: new Date(enrollment.createdAt).toISOString() };
    },
  },
  Course: {
    __resolveReference: async (ref) => {
      const svc = new CourseService();
      return svc.getById(ref.id);
    },
  },
};

module.exports = { courseTypeDefs, courseResolvers };

