export const teacherTypeDefs = `#graphql
  type Teacher {
    id: String
    name: String
    email: String
    created_at: String
  }

  extend type Query {
    teachers: [Teacher]
    teacher(id: String!): Teacher
  }

  extend type Mutation {
    createTeacher(name: String!, email: String!): Teacher
    updateTeacher(id: String!, name: String, email: String): Teacher
  }

  
`;
