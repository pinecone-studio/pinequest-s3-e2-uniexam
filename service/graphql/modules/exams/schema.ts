export const examTypeDefs = `#graphql

enum QuestionDifficulty {
  easy
  medium
  hard
}

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

  input ManualExamQuestionInput {
    content: String!
    difficulty: QuestionDifficulty!
    options: [String!]!
    correctOptionIndex: Int!
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
      type: String
    ): Exam
    deleteExam(id: String!): Boolean

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
  }
`;
