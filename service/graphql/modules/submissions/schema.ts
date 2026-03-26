export const submissionTypeDefs = `#graphql
  type Submission {
    id: String
    student_id: String
    exam_id: String
    started_at: String
    submitted_at: String
    score: Int
    answers: [SubmissionAnswer]
  }

  extend type Query {
    submissions: [Submission]
    submission(id: String!): Submission
  }

  extend type Mutation {
    createSubmission(
      student_id: String!
      exam_id: String!
      started_at: String!
      submitted_at: String
      score: Int
    ): Submission
    updateSubmission(
      id: String!
      student_id: String
      exam_id: String
      started_at: String
      submitted_at: String
      score: Int
    ): Submission
  }
`;
