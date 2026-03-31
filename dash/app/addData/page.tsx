"use client";

import { useMemo, useState } from "react";
import { graphqlRequest } from "@/lib/graphql";

type Operation = {
  id: string;
  label: string;
  category: "Query" | "Mutation";
  query: string;
  variables: string; // JSON string
};

const OPERATIONS: Operation[] = [
  // -------------------- COURSES --------------------
  {
    id: "courses",
    label: "courses",
    category: "Query",
    query: `#graphql
query Courses {
  courses {
    id
    name
    code
    teacher_id
  }
}
`,
    variables: "{}",
  },
  {
    id: "course",
    label: "course(id)",
    category: "Query",
    query: `#graphql
query Course($id: String!) {
  course(id: $id) {
    id
    name
    code
    teacher_id
  }
}
`,
    variables: `{
  "id": "PUT_COURSE_ID_HERE"
}`,
  },
  {
    id: "courseByCode",
    label: "courseByCode(code)",
    category: "Query",
    query: `#graphql
query CourseByCode($code: String!) {
  courseByCode(code: $code) {
    id
    name
    code
    teacher_id
  }
}
`,
    variables: `{
  "code": "CS101"
}`,
  },
  {
    id: "createCourse",
    label: "createCourse",
    category: "Mutation",
    query: `#graphql
mutation CreateCourse($name: String!, $code: String!, $teacher_id: String!) {
  createCourse(name: $name, code: $code, teacher_id: $teacher_id) {
    id
    name
    code
    teacher_id
  }
}
`,
    variables: `{
  "name": "Algorithms",
  "code": "CS101",
  "teacher_id": "PUT_TEACHER_ID_HERE"
}`,
  },
  {
    id: "updateCourse",
    label: "updateCourse",
    category: "Mutation",
    query: `#graphql
mutation UpdateCourse($id: String!, $name: String, $code: String, $teacher_id: String) {
  updateCourse(id: $id, name: $name, code: $code, teacher_id: $teacher_id) {
    id
    name
    code
    teacher_id
  }
}
`,
    variables: `{
  "id": "PUT_COURSE_ID_HERE",
  "name": "Algorithms Updated"
}`,
  },

  // -------------------- TEACHERS --------------------
  {
    id: "teachers",
    label: "teachers",
    category: "Query",
    query: `#graphql
query Teachers {
  teachers {
    id
    name
    email
    created_at
  }
}
`,
    variables: "{}",
  },
  {
    id: "teacher",
    label: "teacher(id)",
    category: "Query",
    query: `#graphql
query Teacher($id: String!) {
  teacher(id: $id) {
    id
    name
    email
    created_at
  }
}
`,
    variables: `{
  "id": "PUT_TEACHER_ID_HERE"
}`,
  },
  {
    id: "createTeacher",
    label: "createTeacher",
    category: "Mutation",
    query: `#graphql
mutation CreateTeacher($name: String!, $email: String!) {
  createTeacher(name: $name, email: $email) {
    id
    name
    email
    created_at
  }
}
`,
    variables: `{
  "name": "Teacher One",
  "email": "teacher1@example.com"
}`,
  },
  {
    id: "updateTeacher",
    label: "updateTeacher",
    category: "Mutation",
    query: `#graphql
mutation UpdateTeacher($id: String!, $name: String, $email: String) {
  updateTeacher(id: $id, name: $name, email: $email) {
    id
    name
    email
    created_at
  }
}
`,
    variables: `{
  "id": "PUT_TEACHER_ID_HERE",
  "name": "Teacher Updated"
}`,
  },

  // -------------------- STUDENTS --------------------
  {
    id: "students",
    label: "students",
    category: "Query",
    query: `#graphql
query Students {
  students {
    id
    name
    email
    created_at
  }
}
`,
    variables: "{}",
  },
  {
    id: "student",
    label: "student(id)",
    category: "Query",
    query: `#graphql
query Student($id: String!) {
  student(id: $id) {
    id
    name
    email
    created_at
  }
}
`,
    variables: `{
  "id": "PUT_STUDENT_ID_HERE"
}`,
  },
  {
    id: "studentByEmail",
    label: "studentByEmail(email)",
    category: "Query",
    query: `#graphql
query StudentByEmail($email: String!) {
  studentByEmail(email: $email) {
    id
    name
    email
    created_at
  }
}
`,
    variables: `{
  "email": "student1@example.com"
}`,
  },
  {
    id: "createStudent",
    label: "createStudent",
    category: "Mutation",
    query: `#graphql
mutation CreateStudent($name: String!, $email: String!) {
  createStudent(name: $name, email: $email) {
    id
    name
    email
    created_at
  }
}
`,
    variables: `{
  "name": "Student One",
  "email": "student1@example.com"
}`,
  },
  {
    id: "updateStudent",
    label: "updateStudent",
    category: "Mutation",
    query: `#graphql
mutation UpdateStudent($id: String!, $name: String, $email: String) {
  updateStudent(id: $id, name: $name, email: $email) {
    id
    name
    email
    created_at
  }
}
`,
    variables: `{
  "id": "PUT_STUDENT_ID_HERE",
  "name": "Student Updated"
}`,
  },

  // -------------------- ENROLLMENTS --------------------
  {
    id: "enrollments",
    label: "enrollments",
    category: "Query",
    query: `#graphql
query Enrollments {
  enrollments {
    id
    student_id
    course_id
  }
}
`,
    variables: "{}",
  },
  {
    id: "enrollment",
    label: "enrollment(id)",
    category: "Query",
    query: `#graphql
query Enrollment($id: String!) {
  enrollment(id: $id) {
    id
    student_id
    course_id
  }
}
`,
    variables: `{
  "id": "PUT_ENROLLMENT_ID_HERE"
}`,
  },
  {
    id: "createEnrollment",
    label: "createEnrollment",
    category: "Mutation",
    query: `#graphql
mutation CreateEnrollment($student_id: String!, $course_id: String!) {
  createEnrollment(student_id: $student_id, course_id: $course_id) {
    id
    student_id
    course_id
  }
}
`,
    variables: `{
  "student_id": "PUT_STUDENT_ID_HERE",
  "course_id": "PUT_COURSE_ID_HERE"
}`,
  },
  {
    id: "updateEnrollment",
    label: "updateEnrollment",
    category: "Mutation",
    query: `#graphql
mutation UpdateEnrollment($id: String!, $student_id: String, $course_id: String) {
  updateEnrollment(id: $id, student_id: $student_id, course_id: $course_id) {
    id
    student_id
    course_id
  }
}
`,
    variables: `{
  "id": "PUT_ENROLLMENT_ID_HERE",
  "course_id": "PUT_COURSE_ID_HERE"
}`,
  },

  // -------------------- EXAMS --------------------
  {
    id: "exams",
    label: "exams",
    category: "Query",
    query: `#graphql
query Exams {
  exams {
    id
    course_id
    title
    description
    start_time
    end_time
    duration
    type
    image_url
  }
}
`,
    variables: "{}",
  },
  {
    id: "exam",
    label: "exam(id)",
    category: "Query",
    query: `#graphql
query Exam($id: String!) {
  exam(id: $id) {
    id
    course_id
    title
    description
    start_time
    end_time
    duration
    type
    image_url
  }
}
`,
    variables: `{
  "id": "PUT_EXAM_ID_HERE"
}`,
  },
  {
    id: "createExam",
    label: "createExam",
    category: "Mutation",
    query: `#graphql
mutation CreateExam(
  $course_id: String!
  $title: String!
  $description: String
  $start_time: String!
  $end_time: String!
  $duration: Int!
  $type: String!
  $image_url: String
) {
  createExam(
    course_id: $course_id
    title: $title
    description: $description
    start_time: $start_time
    end_time: $end_time
    duration: $duration
    type: $type
    image_url: $image_url
  ) {
    id
    course_id
    title
    description
    start_time
    end_time
    duration
    type
    image_url
  }
}
`,
    variables: `{
  "course_id": "PUT_COURSE_ID_HERE",
  "title": "Midterm Exam",
  "description": "Chapter 1-5",
  "start_time": "2026-04-01T09:00:00.000Z",
  "end_time": "2026-04-01T10:30:00.000Z",
  "duration": 90,
  "type": "manual",
  "image_url": null
}`,
  },
  {
    id: "updateExam",
    label: "updateExam",
    category: "Mutation",
    query: `#graphql
mutation UpdateExam(
  $id: String!
  $title: String
  $description: String
  $duration: Int
) {
  updateExam(
    id: $id
    title: $title
    description: $description
    duration: $duration
  ) {
    id
    title
    description
    duration
  }
}
`,
    variables: `{
  "id": "PUT_EXAM_ID_HERE",
  "title": "Midterm Exam Updated",
  "duration": 120
}`,
  },
  {
    id: "deleteExam",
    label: "deleteExam",
    category: "Mutation",
    query: `#graphql
mutation DeleteExam($id: String!) {
  deleteExam(id: $id)
}
`,
    variables: `{
  "id": "PUT_EXAM_ID_HERE"
}`,
  },

  // -------------------- QUESTIONS --------------------
  {
    id: "questions",
    label: "questions",
    category: "Query",
    query: `#graphql
query Questions {
  questions {
    id
    text
    image_url
    type
    difficulty
    category
    order_index
  }
}
`,
    variables: "{}",
  },
  {
    id: "question",
    label: "question(id)",
    category: "Query",
    query: `#graphql
query Question($id: String!) {
  question(id: $id) {
    id
    text
    image_url
    type
    difficulty
    category
    order_index
  }
}
`,
    variables: `{
  "id": "PUT_QUESTION_ID_HERE"
}`,
  },
  {
    id: "createQuestion",
    label: "createQuestion",
    category: "Mutation",
    query: `#graphql
mutation CreateQuestion(
  $text: String!
  $type: String!
  $difficulty: QuestionDifficulty!
  $category: String
  $image_url: String
) {
  createQuestion(
    text: $text
    type: $type
    difficulty: $difficulty
    category: $category
    image_url: $image_url
  ) {
    id
    text
    type
    difficulty
    category
    image_url
  }
}
`,
    variables: `{
  "text": "2+2=?",
  "type": "multiple_choice",
  "difficulty": "easy",
  "category": "math",
  "image_url": null
}`,
  },
  {
    id: "updateQuestion",
    label: "updateQuestion",
    category: "Mutation",
    query: `#graphql
mutation UpdateQuestion(
  $id: String!
  $text: String
  $difficulty: QuestionDifficulty
) {
  updateQuestion(
    id: $id
    text: $text
    difficulty: $difficulty
  ) {
    id
    text
    difficulty
  }
}
`,
    variables: `{
  "id": "PUT_QUESTION_ID_HERE",
  "text": "3+3=?",
  "difficulty": "medium"
}`,
  },
  {
    id: "deleteQuestion",
    label: "deleteQuestion",
    category: "Mutation",
    query: `#graphql
mutation DeleteQuestion($id: String!) {
  deleteQuestion(id: $id)
}
`,
    variables: `{
  "id": "PUT_QUESTION_ID_HERE"
}`,
  },

  // -------------------- ANSWERS --------------------
  {
    id: "answers",
    label: "answers",
    category: "Query",
    query: `#graphql
query Answers {
  answers {
    id
    question_id
    text
    is_correct
    order_index
  }
}
`,
    variables: "{}",
  },
  {
    id: "answer",
    label: "answer(id)",
    category: "Query",
    query: `#graphql
query Answer($id: String!) {
  answer(id: $id) {
    id
    question_id
    text
    is_correct
    order_index
  }
}
`,
    variables: `{
  "id": "PUT_ANSWER_ID_HERE"
}`,
  },
  {
    id: "createAnswer",
    label: "createAnswer",
    category: "Mutation",
    query: `#graphql
mutation CreateAnswer($question_id: String!, $text: String!, $is_correct: Boolean!) {
  createAnswer(question_id: $question_id, text: $text, is_correct: $is_correct) {
    id
    question_id
    text
    is_correct
  }
}
`,
    variables: `{
  "question_id": "PUT_QUESTION_ID_HERE",
  "text": "4",
  "is_correct": true
}`,
  },
  {
    id: "updateAnswer",
    label: "updateAnswer",
    category: "Mutation",
    query: `#graphql
mutation UpdateAnswer(
  $id: String!
  $question_id: String
  $text: String
  $is_correct: Boolean
) {
  updateAnswer(
    id: $id
    question_id: $question_id
    text: $text
    is_correct: $is_correct
  ) {
    id
    question_id
    text
    is_correct
  }
}
`,
    variables: `{
  "id": "PUT_ANSWER_ID_HERE",
  "text": "Four"
}`,
  },

  // -------------------- EXAM QUESTIONS --------------------
  {
    id: "examQuestions",
    label: "examQuestions(exam_id)",
    category: "Query",
    query: `#graphql
query ExamQuestions($exam_id: String!) {
  examQuestions(exam_id: $exam_id) {
    id
    exam_id
    question_id
    order_index
    points
  }
}
`,
    variables: `{
  "exam_id": "PUT_EXAM_ID_HERE"
}`,
  },
  {
    id: "addExamQuestion",
    label: "addExamQuestion",
    category: "Mutation",
    query: `#graphql
mutation AddExamQuestion(
  $exam_id: String!
  $question_id: String!
  $order_index: Int!
  $points: Int!
) {
  addExamQuestion(
    exam_id: $exam_id
    question_id: $question_id
    order_index: $order_index
    points: $points
  ) {
    id
    exam_id
    question_id
    order_index
    points
  }
}
`,
    variables: `{
  "exam_id": "PUT_EXAM_ID_HERE",
  "question_id": "PUT_QUESTION_ID_HERE",
  "order_index": 1,
  "points": 5
}`,
  },
  {
    id: "updateExamQuestion",
    label: "updateExamQuestion",
    category: "Mutation",
    query: `#graphql
mutation UpdateExamQuestion($id: String!, $order_index: Int, $points: Int) {
  updateExamQuestion(id: $id, order_index: $order_index, points: $points) {
    id
    exam_id
    question_id
    order_index
    points
  }
}
`,
    variables: `{
  "id": "PUT_EXAM_QUESTION_ID_HERE",
  "points": 10
}`,
  },
  {
    id: "deleteExamQuestion",
    label: "deleteExamQuestion",
    category: "Mutation",
    query: `#graphql
mutation DeleteExamQuestion($id: String!) {
  deleteExamQuestion(id: $id)
}
`,
    variables: `{
  "id": "PUT_EXAM_QUESTION_ID_HERE"
}`,
  },

  // -------------------- SUBMISSIONS --------------------
  {
    id: "submissions",
    label: "submissions",
    category: "Query",
    query: `#graphql
query Submissions {
  submissions {
    id
    student_id
    exam_id
    started_at
    submitted_at
    status
    attempt_number
    score_auto
    score_manual
    final_score
  }
}
`,
    variables: "{}",
  },
  {
    id: "submission",
    label: "submission(id)",
    category: "Query",
    query: `#graphql
query Submission($id: String!) {
  submission(id: $id) {
    id
    student_id
    exam_id
    status
    final_score
  }
}
`,
    variables: `{
  "id": "PUT_SUBMISSION_ID_HERE"
}`,
  },
  {
    id: "createSubmission",
    label: "createSubmission",
    category: "Mutation",
    query: `#graphql
mutation CreateSubmission(
  $student_id: String!
  $exam_id: String!
  $started_at: String!
  $status: SubmissionStatus
  $attempt_number: Int
) {
  createSubmission(
    student_id: $student_id
    exam_id: $exam_id
    started_at: $started_at
    status: $status
    attempt_number: $attempt_number
  ) {
    id
    student_id
    exam_id
    started_at
    status
    attempt_number
  }
}
`,
    variables: `{
  "student_id": "PUT_STUDENT_ID_HERE",
  "exam_id": "PUT_EXAM_ID_HERE",
  "started_at": "2026-04-01T09:00:00.000Z",
  "status": "in_progress",
  "attempt_number": 1
}`,
  },
  {
    id: "updateSubmission",
    label: "updateSubmission",
    category: "Mutation",
    query: `#graphql
mutation UpdateSubmission(
  $id: String!
  $submitted_at: String
  $status: SubmissionStatus
  $final_score: Int
) {
  updateSubmission(
    id: $id
    submitted_at: $submitted_at
    status: $status
    final_score: $final_score
  ) {
    id
    submitted_at
    status
    final_score
  }
}
`,
    variables: `{
  "id": "PUT_SUBMISSION_ID_HERE",
  "submitted_at": "2026-04-01T10:00:00.000Z",
  "status": "submitted",
  "final_score": 80
}`,
  },

  // -------------------- SUBMISSION ANSWERS --------------------
  {
    id: "submissionAnswers",
    label: "submissionAnswers",
    category: "Query",
    query: `#graphql
query SubmissionAnswers {
  submissionAnswers {
    id
    submission_id
    question_id
    answer_id
    text_answer
    is_correct
    score
    feedback
  }
}
`,
    variables: "{}",
  },
  {
    id: "submissionAnswer",
    label: "submissionAnswer(id)",
    category: "Query",
    query: `#graphql
query SubmissionAnswer($id: String!) {
  submissionAnswer(id: $id) {
    id
    submission_id
    question_id
    answer_id
    text_answer
    is_correct
    score
    feedback
  }
}
`,
    variables: `{
  "id": "PUT_SUBMISSION_ANSWER_ID_HERE"
}`,
  },
  {
    id: "createSubmissionAnswer",
    label: "createSubmissionAnswer",
    category: "Mutation",
    query: `#graphql
mutation CreateSubmissionAnswer(
  $submission_id: String!
  $question_id: String!
  $answer_id: String
  $text_answer: String
  $is_correct: Boolean
  $score: Int
  $feedback: String
) {
  createSubmissionAnswer(
    submission_id: $submission_id
    question_id: $question_id
    answer_id: $answer_id
    text_answer: $text_answer
    is_correct: $is_correct
    score: $score
    feedback: $feedback
  ) {
    id
    submission_id
    question_id
    answer_id
    text_answer
    is_correct
    score
    feedback
  }
}
`,
    variables: `{
  "submission_id": "PUT_SUBMISSION_ID_HERE",
  "question_id": "PUT_QUESTION_ID_HERE",
  "answer_id": null,
  "text_answer": "My answer",
  "is_correct": true,
  "score": 5,
  "feedback": "Good"
}`,
  },
  {
    id: "updateSubmissionAnswer",
    label: "updateSubmissionAnswer",
    category: "Mutation",
    query: `#graphql
mutation UpdateSubmissionAnswer(
  $id: String!
  $text_answer: String
  $is_correct: Boolean
  $score: Int
  $feedback: String
) {
  updateSubmissionAnswer(
    id: $id
    text_answer: $text_answer
    is_correct: $is_correct
    score: $score
    feedback: $feedback
  ) {
    id
    text_answer
    is_correct
    score
    feedback
  }
}
`,
    variables: `{
  "id": "PUT_SUBMISSION_ANSWER_ID_HERE",
  "feedback": "Updated feedback"
}`,
  },

  // -------------------- EXAM SQS --------------------
  {
    id: "generateExam",
    label: "generateExam(courseId, topic)",
    category: "Mutation",
    query: `#graphql
mutation GenerateExam($courseId: String!, $topic: String!) {
  generateExam(courseId: $courseId, topic: $topic)
}
`,
    variables: `{
  "courseId": "PUT_COURSE_ID_HERE",
  "topic": "Graph Theory"
}`,
  },
];

export default function AddDataPage() {
  const [selectedId, setSelectedId] = useState<string>(OPERATIONS[0].id);
  const selected = useMemo(
    () => OPERATIONS.find((o) => o.id === selectedId) ?? OPERATIONS[0],
    [selectedId],
  );

  const [query, setQuery] = useState<string>(OPERATIONS[0].query);
  const [variablesText, setVariablesText] = useState<string>(
    OPERATIONS[0].variables,
  );
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState<string>("");
  const [rememberedTeacherId, setRememberedTeacherId] = useState<string>("");

  const withAutoTeacherId = (
    operationId: string,
    rawVariables: string,
    forcedTeacherId?: string,
  ) => {
    const teacherId = forcedTeacherId ?? rememberedTeacherId;
    if (operationId !== "createCourse" || !teacherId) return rawVariables;

    try {
      const parsed = rawVariables.trim()
        ? (JSON.parse(rawVariables) as Record<string, unknown>)
        : {};

      const current = parsed.teacher_id;
      if (
        current === undefined ||
        current === "" ||
        current === "PUT_TEACHER_ID_HERE"
      ) {
        parsed.teacher_id = teacherId;
      }

      return JSON.stringify(parsed, null, 2);
    } catch {
      return rawVariables;
    }
  };

  const onSelectOperation = (id: string) => {
    const op = OPERATIONS.find((o) => o.id === id);
    if (!op) return;
    setSelectedId(op.id);
    setQuery(op.query);
    setVariablesText(withAutoTeacherId(op.id, op.variables));
  };

  const runOperation = async () => {
    let data: Record<string, unknown> | undefined;
    setLoading(true);
    setResponseText("");

    try {
      const parsedVariables = variablesText.trim()
        ? (JSON.parse(variablesText) as Record<string, unknown>)
        : {};

      const data = await graphqlRequest<Record<string, unknown>>(
        query,
        parsedVariables,
      );
      setResponseText(JSON.stringify({ data }, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResponseText(JSON.stringify({ error: message }, null, 2));
      if (selectedId === "createTeacher") {
        const created = (data as Record<string, unknown>).createTeacher as
          | { id?: string }
          | undefined;

        const newTeacherId =
          created && typeof created.id === "string" ? created.id : "";

        if (newTeacherId) {
          setRememberedTeacherId(newTeacherId);

          // Шууд дараагийн алхам руу оруулах: createCourse
          const createCourseOp = OPERATIONS.find(
            (o) => o.id === "createCourse",
          );
          if (createCourseOp) {
            setSelectedId(createCourseOp.id);
            setQuery(createCourseOp.query);
            setVariablesText(
              withAutoTeacherId(
                createCourseOp.id,
                createCourseOp.variables,
                newTeacherId,
              ),
            );
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToSelectedDefault = () => {
    setQuery(selected.query);
    setVariablesText(withAutoTeacherId(selected.id, selected.variables));
  };

  return (
    <div className="min-h-screen p-6 space-y-4 bg-slate-50">
      <h1 className="text-2xl font-bold">Add Data (GraphQL Playground)</h1>
      <p className="text-sm text-slate-600">
        Endpoint: <code>/api/graphql</code> (proxy to{" "}
        <code>localhost:3001/api/graphql</code>)
      </p>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Operation</label>
        <select
          className="border rounded px-3 py-2 bg-white"
          value={selectedId}
          onChange={(e) => onSelectOperation(e.target.value)}
        >
          {OPERATIONS.map((op) => (
            <option key={op.id} value={op.id}>
              [{op.category}] {op.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">GraphQL Query / Mutation</label>
        <textarea
          className="border rounded p-3 font-mono text-sm bg-white min-h-[220px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Variables (JSON)</label>
        <textarea
          className="border rounded p-3 font-mono text-sm bg-white min-h-[200px]"
          value={variablesText}
          onChange={(e) => setVariablesText(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={runOperation}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {loading ? "Running..." : "Run"}
        </button>
        <button
          type="button"
          onClick={resetToSelectedDefault}
          className="px-4 py-2 rounded border bg-white"
        >
          Reset selected template
        </button>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Response</label>
        <pre className="border rounded p-3 font-mono text-xs bg-black text-green-300 overflow-auto min-h-[220px]">
          {responseText || "// Result will appear here"}
        </pre>
      </div>
    </div>
  );
}
