export const answerTypeDefs = `#graphql
  type Answer {
    id: String
    question_id: String
    text: String
    is_correct: Boolean
  }

  extend type Query {
    answers: [Answer]
    answer(id: String!): Answer
  }

  extend type Mutation {
    createAnswer(question_id: String!, text: String!, is_correct: Boolean!): Answer
    updateAnswer(id: String!, question_id: String, text: String, is_correct: Boolean): Answer
  }
`;
