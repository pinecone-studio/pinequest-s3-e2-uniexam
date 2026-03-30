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
    course: Course
    type: String
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

  enum QuestionDifficulty {
    easy
    medium
    hard
  }

  input ManualExamQuestionInput {
    content: String!
    difficulty: QuestionDifficulty!
    options: [String!]!
    correctOptionIndex: Int!
  }

  extend type Mutation {
    createExam(
      course_id: String!
      title: String!
      description: String
      start_time: String!
      end_time: String!
      duration: Int!
      type: String!
    ): Exam
    createExamWithQuestions(
      course_id: String!
      title: String!
      description: String
      start_time: String!
      end_time: String!
      duration: Int!
      type: String!
      questions: [CreateQuestionInput!]!
    ): Exam
    saveExamManual(
      course_id: String!
      title: String!
      description: String
      start_time: String!
      end_time: String!
      duration: Int!
      type: String!
      questions: [ManualExamQuestionInput!]!
    ): Exam
    updateExam(
      id: String!
      course_id: String
      title: String
      description: String
      start_time: String
      end_time: String
      duration: Int
      type: String!
    ): Exam
    deleteExam(id: String!): Boolean
  }
`;
