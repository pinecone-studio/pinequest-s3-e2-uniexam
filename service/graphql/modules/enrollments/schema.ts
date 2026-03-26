export const enrollmentTypeDefs = `#graphql
  type Enrollment {
    id: String
    student_id: String
    course_id: String
  }

  extend type Query {
    enrollments: [Enrollment]
    enrollment(id: String!): Enrollment
  }

  extend type Mutation {
    createEnrollment(student_id: String!, course_id: String!): Enrollment
    updateEnrollment(id: String!, student_id: String, course_id: String): Enrollment
  }
`;
