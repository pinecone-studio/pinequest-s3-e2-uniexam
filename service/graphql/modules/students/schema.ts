export const studentTypeDefs = `#graphql
  type Student {
    id: String
    name: String
    email: String
    created_at: String
  }

  extend type Query {
    students: [Student]
    student(id: String!): Student
    studentByEmail(email: String!): Student
  }

  extend type Mutation {
    createStudent(name: String!, email: String!): Student
    updateStudent(id: String!, name: String, email: String): Student
  }
`;
