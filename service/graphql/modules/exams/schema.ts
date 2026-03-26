export const examTypeDefs = `#graphql
  type Exam {
    id: String
    course_id: String
    title: String
    description: String
    start_time: String
    end_time: String
    duration: Int
    questions: [Question]
  }

  extend type Query {
    exams: [Exam]
    exam(id: String!): Exam
  }

  input CreateQuestionInput {
  text: String!
  type: String!
  order_index: Int!
}

  extend type Mutation {
    createExam(
      course_id: String!
      title: String!
      description: String
      start_time: String!
      end_time: String!
      duration: Int!
    ): Exam
    createExamWithQuestions(
      course_id: String!
      title: String!
      description: String
      start_time: String!
      end_time: String!
      duration: Int!
      questions: [CreateQuestionInput!]!
    ): Exam
    updateExam(
      id: String!
      course_id: String
      title: String
      description: String
      start_time: String
      end_time: String
      duration: Int
    ): Exam
  }
`;
