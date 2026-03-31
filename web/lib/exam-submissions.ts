import { graphqlRequest } from "@/lib/graphql";
import { ExamQuestion } from "@/app/exam/exam-types";

type StudentLookupResponse = {
  studentByEmail: {
    id: string;
  } | null;
};

type CreateStudentResponse = {
  createStudent: {
    id: string;
  };
};

type CreateSubmissionResponse = {
  createSubmission: {
    id: string;
  };
};

type CreateSubmissionAnswerResponse = {
  createSubmissionAnswer: {
    id: string;
  } | null;
};

type SubmitExamInput = {
  studentEmail: string;
  studentName: string;
  examId: string;
  startedAt: string;
  submittedAt: string;
  questions: ExamQuestion[];
  answers: Record<number, string | null>;
};

type SubmissionAnswer =
  | {
      questionId: string;
      textAnswer: string;
    }
  | {
      questionId: string;
      answerId: string;
    };

const STUDENT_BY_EMAIL_QUERY = `
  query StudentByEmail($email: String!) {
    studentByEmail(email: $email) {
      id
    }
  }
`;

const CREATE_STUDENT_MUTATION = `
  mutation CreateStudent($name: String!, $email: String!) {
    createStudent(name: $name, email: $email) {
      id
    }
  }
`;

const CREATE_SUBMISSION_MUTATION = `
  mutation CreateSubmission(
    $studentId: String!
    $examId: String!
    $startedAt: String!
    $submittedAt: String!
    $status: SubmissionStatus
  ) {
    createSubmission(
      student_id: $studentId
      exam_id: $examId
      started_at: $startedAt
      submitted_at: $submittedAt
      status: $status
    ) {
      id
    }
  }
`;

const CREATE_SUBMISSION_ANSWER_MUTATION = `
  mutation CreateSubmissionAnswer(
    $submissionId: String!
    $questionId: String!
    $answerId: String
    $textAnswer: String
  ) {
    createSubmissionAnswer(
      submission_id: $submissionId
      question_id: $questionId
      answer_id: $answerId
      text_answer: $textAnswer
    ) {
      id
    }
  }
`;

const resolveStudentId = async (studentEmail: string, studentName: string) => {
  const existingStudent = await graphqlRequest<StudentLookupResponse>(
    STUDENT_BY_EMAIL_QUERY,
    { email: studentEmail },
  );

  if (existingStudent.studentByEmail?.id) {
    return existingStudent.studentByEmail.id;
  }

  const createdStudent = await graphqlRequest<CreateStudentResponse>(
    CREATE_STUDENT_MUTATION,
    {
      name: studentName,
      email: studentEmail,
    },
  );

  if (!createdStudent.createStudent?.id) {
    throw new Error("Оюутны мэдээлэл үүсгэж чадсангүй.");
  }

  return createdStudent.createStudent.id;
};

const buildSubmissionAnswers = (
  questions: ExamQuestion[],
  answers: Record<number, string | null>,
): SubmissionAnswer[] => {
  return questions.flatMap<SubmissionAnswer>((question) => {
    const rawAnswer = answers[question.id];

    if (!rawAnswer) {
      return [];
    }

    if (question.type === "Short Answer") {
      const textAnswer = rawAnswer.trim();

      if (!textAnswer) {
        return [];
      }

      return [
        {
          questionId: question.questionId,
          textAnswer,
        },
      ];
    }

    const selectedChoice = question.choices?.find((choice) => choice.id === rawAnswer);

    if (!selectedChoice?.answerId) {
      return [];
    }

    return [
      {
        questionId: question.questionId,
        answerId: selectedChoice.answerId,
      },
    ];
  });
};

export const submitExamToBackend = async ({
  studentEmail,
  studentName,
  examId,
  startedAt,
  submittedAt,
  questions,
  answers,
}: SubmitExamInput) => {
  const studentId = await resolveStudentId(studentEmail, studentName);

  const submissionResponse = await graphqlRequest<CreateSubmissionResponse>(
    CREATE_SUBMISSION_MUTATION,
    {
      studentId,
      examId,
      startedAt,
      submittedAt,
      status: "submitted",
    },
  );

  const submissionId = submissionResponse.createSubmission?.id;

  if (!submissionId) {
    throw new Error("Шалгалтын submission үүсгэж чадсангүй.");
  }

  const submissionAnswers = buildSubmissionAnswers(questions, answers);

  await Promise.all(
    submissionAnswers.map((answer) =>
      graphqlRequest<CreateSubmissionAnswerResponse>(
        CREATE_SUBMISSION_ANSWER_MUTATION,
        {
          submissionId,
          questionId: answer.questionId,
          answerId: "answerId" in answer ? answer.answerId : undefined,
          textAnswer: "textAnswer" in answer ? answer.textAnswer : undefined,
        },
      ),
    ),
  );

  return submissionId;
};
