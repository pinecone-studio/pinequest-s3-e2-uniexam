export const examQuestionTypeDefs = `#graphql
  type ExamQuestion {
    id: String
    exam_id: String
    question_id: String
    order_index: Int
    points: Int
    question: Question
  }

  extend type Query {
    examQuestions(exam_id: String!): [ExamQuestion]
  }

  extend type Mutation {
    addExamQuestion(
      exam_id: String!
      question_id: String!
      order_index: Int!
      points: Int!
    ): ExamQuestion

    updateExamQuestion(
      id: String!
      order_index: Int
      points: Int
    ): ExamQuestion

    deleteExamQuestion(id: String!): Boolean
  }
`;
