export const questionTypeDefs = `#graphql
  type Question {
    id: String
    exam_id: String
    text: String
    type: String
    order_index: Int
  }

  extend type Query {
    questions: [Question]
    question(id: String!): Question
  }

  extend type Mutation {
    createQuestion(exam_id: String!, text: String!, type: String!, order_index: Int!): Question
    updateQuestion(id: String!, exam_id: String, text: String, type: String, order_index: Int): Question
  }
`;
