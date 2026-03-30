export const questionTypeDefs = `#graphql

enum QuestionDifficulty {
  easy
  medium
  hard
}
  type Question {
    id: String
    text: String
    type: String
    difficulty: QuestionDifficulty
    category: String
    order_index: Int
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
      difficulty: QuestionDifficulty!
      category: String
    ): Question

    updateQuestion(
      id: String!
      text: String
      type: String
      difficulty: QuestionDifficulty
      category: String
    ): Question

    deleteQuestion(id: String!): Boolean
  }
`;
