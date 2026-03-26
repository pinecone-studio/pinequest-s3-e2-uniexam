export const submissionAnswerTypeDefs = `#graphql
  type SubmissionAnswer {
    id: String
    submission_id: String
    question_id: String
    answer_id: String
    text_answer: String
  }

  extend type Query {
    submissionAnswers: [SubmissionAnswer]
    submissionAnswer(id: String!): SubmissionAnswer
  }

  extend type Mutation {
    createSubmissionAnswer(
      submission_id: String!
      question_id: String!
      answer_id: String
      text_answer: String
    ): SubmissionAnswer
    updateSubmissionAnswer(
      id: String!
      submission_id: String
      question_id: String
      answer_id: String
      text_answer: String
    ): SubmissionAnswer
  }
`;
