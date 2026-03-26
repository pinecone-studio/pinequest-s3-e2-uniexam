export const courseTypeDefs = `#graphql
  type Course {
    id: String
    name: String
    code: String
    teacher_id: String
    exams: [Exam]
  }

  extend type Query {
    courses: [Course]
    course(id: String!): Course
    courseByCode(code: String!): Course
  }

  extend type Mutation {
    createCourse(name: String!, code: String!, teacher_id: String!): Course
    updateCourse(id: String!, name: String, code: String, teacher_id: String): Course
  }
`;
