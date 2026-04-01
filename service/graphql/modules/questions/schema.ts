export const questionTypeDefs = `#graphql

enum QuestionDifficulty {
  easy
  medium
  hard
}
  type Question {
    id: String
    text: String
    image_url: String
    type: String
    question_type: String
    difficulty: QuestionDifficulty
    category: String
    order_index: Int
    max_points: Int
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
      image_url: String
    ): Question

    updateQuestion(
      id: String!
      text: String
      type: String
      difficulty: QuestionDifficulty
      category: String
      image_url: String
    ): Question

    deleteQuestion(id: String!): Boolean
  }
`;
