export const questionTypeDefs = `#graphql
  type Question {
    id: String
    exam_id: String
    text: String
    type: String
    order_index: Int
    difficulty: String
    answers: [Answer]
  }

  extend type Query {
    questions: [Question]
    question(id: String!): Question
  }

  extend type Mutation {
    createQuestion(exam_id: String!, text: String!, type: String!, order_index: Int!): Question
    updateQuestion(id: String!, exam_id: String, text: String, type: String, order_index: Int, difficulty: String): Question
    addManualQuestionToExam(
      exam_id: String!
      content: String!
      difficulty: QuestionDifficulty!
      options: [String!]!
      correctOptionIndex: Int!
    ): Question
    updateManualQuestion(
      id: String!
      content: String!
      difficulty: QuestionDifficulty!
      options: [String!]!
      correctOptionIndex: Int!
    ): Question
    deleteQuestion(id: String!): Boolean
  }
`;
