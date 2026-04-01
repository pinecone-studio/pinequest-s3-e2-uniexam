export const examTypeDefs = `#graphql

enum QuestionDifficulty {
  easy
  medium
  hard
}

enum QuestionType {
  multiple_choice
  open_ended
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
    image_url: String
  }

  extend type Query {
    exams: [Exam]
    exam(id: String!): Exam
  }

  input ManualExamQuestionInput {
    content: String!
    image_url: String
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
      image_url: String
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
      image_url: String
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
      image_url: String
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
      image_url: String
    ): Exam
    deleteExam(id: String!): Boolean

    addManualQuestionToExam(
      exam_id: String!
      content: String!
      image_url: String
      difficulty: QuestionDifficulty!
      options: [String!]!
      correctOptionIndex: Int!
    ): Question

    updateManualQuestion(
      id: String!
      content: String!
      image_url: String
      difficulty: QuestionDifficulty!
      options: [String!]!
      correctOptionIndex: Int!
    ): Question

    addOpenEndedQuestion(
      exam_id: String!
      content: String!
      image_url: String
      difficulty: QuestionDifficulty!
      max_points: Int
    ): Question

    updateOpenEndedQuestion(
      id: String!
      content: String!
      image_url: String
      difficulty: QuestionDifficulty!
      max_points: Int
    ): Question

    deleteQuestion(id: String!): Boolean
  }
`;
