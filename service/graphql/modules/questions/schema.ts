export const questionTypeDefs = `#graphql
  type Question {
    id: String
    text: String
    type: String
    difficulty: String
    category: String
    answers: [Answer]
  }

  extend type Query {
    questions: [Question]
    question(id: String!): Question
  }

  extend type Mutation {
    createQuestion(
      text: String!
      type: String!
      difficulty: String
      category: String
    ): Question

    updateQuestion(
      id: String!
      text: String
      type: String
      difficulty: String
      category: String
    ): Question

    deleteQuestion(id: String!): Boolean
  }
`;
