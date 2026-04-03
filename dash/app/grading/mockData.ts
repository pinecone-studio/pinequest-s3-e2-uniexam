import type {
  ClassCourse,
  EssayQuestion,
  RubricCriterion,
  Student,
} from "@/lib/grading/types";

type GqlError = { message: string };

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await res.json()) as { data?: T; errors?: GqlError[] };
  if (!res.ok || json.errors?.length || !json.data) {
    throw new Error(json.errors?.[0]?.message ?? "GraphQL request failed");
  }
  return json.data;
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function toRelative(iso?: string | null): string {
  if (!iso) return "сая";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.floor(ms / 60000));
  if (min < 60) return `${min}м өмнө`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}ц өмнө`;
  const d = Math.floor(hr / 24);
  return `${d}ө өмнө`;
}

const EXAM_POINTS_QUERY = `
query ExamPoints($examId: String!) {
  examQuestions(exam_id: $examId) {
    question_id
    points
  }
}
`;

async function getExamTotalPoints(examId: string): Promise<number> {
  const data = await gql<{
    examQuestions: Array<{ question_id: string; points: number | null }> | null;
  }>(EXAM_POINTS_QUERY, { examId });

  const rows = data.examQuestions ?? [];
  return rows.reduce((sum, row) => sum + (row.points ?? 0), 0);
}

async function getExamQuestionPoints(examId: string): Promise<Map<string, number>> {
  const data = await gql<{
    examQuestions: Array<{ question_id: string; points: number | null }> | null;
  }>(EXAM_POINTS_QUERY, { examId });

  const map = new Map<string, number>();
  for (const row of data.examQuestions ?? []) {
    map.set(String(row.question_id), row.points ?? 0);
  }
  return map;
}

function getClassStudentIds(
  classId: string,
  enrollments: Enrollment[],
  classSubs: Submission[],
): Set<string> {
  const ids = new Set(
    enrollments.filter((e) => e.course_id === classId).map((e) => e.student_id),
  );

  for (const sub of classSubs) {
    if (sub.student_id) ids.add(sub.student_id);
  }

  return ids;
}
const DEFAULT_RUBRIC: RubricCriterion[] = [
  {
    id: "clarity",
    name: "Тодорхой ба Зохион Байгуулалт",
    description: "Бүтэц, урсгал, уншигдах байдал",
    maxScore: 5,
    score: 0,
  },
];

type Course = {
  id: string;
  code: string;
  name: string;
  exams?:
    | { id: string; title?: string | null; questions?: Question[] | null }[]
    | null;
};
type Enrollment = { id: string; student_id: string; course_id: string };
type SubmissionAnswer = {
  id: string;
  question_id: string;
  answer_id?: string | null;
  text_answer?: string | null;
  score?: number | null;
  feedback?: string | null;
};
type Submission = {
  id: string;
  student_id: string;
  exam_id: string;
  started_at?: string | null;
  submitted_at?: string | null;
  score_auto?: number | null;
  score_manual?: number | null;
  final_score?: number | null;
  answers?: SubmissionAnswer[] | null;
};
type StudentRow = { id: string; name: string; email: string };
type Question = {
  id: string;
  text: string;
  image_url?: string | null;
  type?: string | null;
  order_index?: number | null;
};

function clampScore(value: number | null | undefined, maxScore: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.round(value ?? 0), 0), maxScore);
}

function isManualQuestionType(type?: string | null): boolean {
  if (!type) return true;
  const normalized = type.toLowerCase();
  return (
    normalized.includes("essay") ||
    normalized.includes("written") ||
    normalized.includes("text") ||
    normalized.includes("open") ||
    normalized.includes("subjective") ||
    normalized.includes("short")
  );
}
const BOOT_QUERY = `
query GradingBoot {
  courses { id code name exams { id title } }
  enrollments { id student_id course_id }
  students { id name email }
  submissions {
    id
    student_id
    exam_id
    started_at
    submitted_at
    score_auto
    score_manual
    final_score
  }
}
`;

export async function fetchGradingClasses(): Promise<ClassCourse[]> {
  const data = await gql<{
    courses: Course[];
    enrollments: Enrollment[];
    submissions: Submission[];
  }>(BOOT_QUERY);

  return Promise.all(
    data.courses.map(async (c) => {
      const examIds = new Set((c.exams ?? []).map((e) => e.id));
      const courseSubs = data.submissions.filter((s) => examIds.has(s.exam_id));

      const classStudentIds = getClassStudentIds(
        c.id,
        data.enrollments,
        courseSubs,
      );

      const latestByStudent = new Map<string, Submission>();
      for (const s of courseSubs) {
        const prev = latestByStudent.get(s.student_id);
        const prevTs = new Date(
          prev?.submitted_at ?? prev?.started_at ?? 0,
        ).getTime();
        const nextTs = new Date(s.submitted_at ?? s.started_at ?? 0).getTime();
        if (!prev || nextTs >= prevTs) latestByStudent.set(s.student_id, s);
      }

      const latestSubs = Array.from(latestByStudent.values());

      const graded = latestSubs.filter(
        (s) => s.final_score !== null && s.final_score !== undefined,
      ).length;
      const total = classStudentIds.size;
      const pending = Math.max(classStudentIds.size - graded, 0);

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        assignmentLabel: c.exams?.[0]?.title ?? "Шалгалт",
        total,
        pending,
        graded,
      };
    }),
  );
}

export async function fetchClassStudents(classId: string): Promise<{
  course: ClassCourse | null;
  students: Student[];
}> {
  const data = await gql<{
    courses: Course[];
    enrollments: Enrollment[];
    students: StudentRow[];
    submissions: Submission[];
  }>(BOOT_QUERY);

  const course = data.courses.find((c) => c.id === classId);
  if (!course) return { course: null, students: [] };

  const examIds = new Set((course.exams ?? []).map((e) => e.id));
  const examTotalEntries = await Promise.all(
    Array.from(examIds).map(async (examId) => {
      const total = await getExamTotalPoints(examId);
      return [examId, total] as const;
    }),
  );
  const examTotalById = new Map(examTotalEntries);
  const courseSubs = data.submissions.filter((s) => examIds.has(s.exam_id));
  const classStudentIds = getClassStudentIds(
    classId,
    data.enrollments,
    courseSubs,
  );
  const latestByStudent = new Map<string, Submission>();
  for (const s of courseSubs) {
    const prev = latestByStudent.get(s.student_id);
    const prevTs = new Date(
      prev?.submitted_at ?? prev?.started_at ?? 0,
    ).getTime();
    const nextTs = new Date(s.submitted_at ?? s.started_at ?? 0).getTime();
    if (!prev || nextTs >= prevTs) latestByStudent.set(s.student_id, s);
  }

  const students = data.students
    .filter((s) => classStudentIds.has(s.id))
    .map((s) => {
      const sub = latestByStudent.get(s.id);
      const graded =
        sub?.final_score !== null && sub?.final_score !== undefined;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        initials: toInitials(s.name),
        submittedAt: toRelative(sub?.submitted_at ?? sub?.started_at),
        status: graded ? "Дүгнэгдсэн" : "Хүлээгдэж байна",
        mcScore: sub?.score_auto ?? 0,
        finalScore: sub?.final_score ?? null,
        mcTotal: sub?.exam_id ? (examTotalById.get(sub.exam_id) ?? 0) : 0,
        essays: [],
      } satisfies Student;
    });

  return {
    course: {
      id: course.id,
      code: course.code,
      name: course.name,
      assignmentLabel: course.exams?.[0]?.title ?? "Шалгалт",
      pending: students.filter((s) => s.status === "Хүлээгдэж байна").length,
      graded: students.filter((s) => s.status === "Дүгнэгдсэн").length,
      total: students.length,
    },
    students,
  };
}
const STUDENT_QUERY = `
query GradingStudent($courseId: String!, $studentId: String!) {
  course(id: $courseId) {
    id
    code
    name
    exams {
      id
      title
    }
  }
  student(id: $studentId) { id name email }
  students { id name email }
  enrollments { id student_id course_id }
  submissions {
    id
    student_id
    exam_id
    started_at
    submitted_at
    score_auto
    score_manual
    final_score
    answers { id question_id answer_id text_answer score feedback }
  }
}
`;

const EXAM_DETAIL_QUERY = `
query GradingExam($examId: String!) {
  exam(id: $examId) {
    id
    title
    questions {
      id
      text
      image_url
      type
      order_index
    }
  }
}
`;

export async function fetchStudentGradingContext(
  classId: string,
  studentId: string,
): Promise<{
  course: ClassCourse | null;
  classStudents: Student[];
  student: Student | null;
  submissionId: string | null;
}> {
  const data = await gql<{
    course: Course | null;
    student: StudentRow | null;
    students: StudentRow[];
    enrollments: Enrollment[];
    submissions: Submission[];
  }>(STUDENT_QUERY, { courseId: classId, studentId });

  if (!data.course || !data.student) {
    return {
      course: null,
      classStudents: [],
      student: null,
      submissionId: null,
    };
  }

  const examIds = new Set((data.course.exams ?? []).map((e) => e.id));

  const classSubs = data.submissions.filter((s) => examIds.has(s.exam_id));
  const classExamIds = Array.from(new Set(classSubs.map((s) => s.exam_id)));
  const classExamTotalEntries = await Promise.all(
    classExamIds.map(async (examId) => {
      const total = await getExamTotalPoints(examId);
      return [examId, total] as const;
    }),
  );
  const classExamTotalById = new Map(classExamTotalEntries);
  const classStudentIds = getClassStudentIds(
    classId,
    data.enrollments,
    classSubs,
  );

  const latestByStudent = new Map<string, Submission>();
  for (const s of classSubs) {
    const prev = latestByStudent.get(s.student_id);
    const prevTs = new Date(
      prev?.submitted_at ?? prev?.started_at ?? 0,
    ).getTime();
    const nextTs = new Date(s.submitted_at ?? s.started_at ?? 0).getTime();
    if (!prev || nextTs >= prevTs) latestByStudent.set(s.student_id, s);
  }

  const studentMap = new Map(data.students.map((s) => [s.id, s]));

  const classStudents = Array.from(classStudentIds).map((sid) => {
    const row = studentMap.get(sid);
    const sub = latestByStudent.get(sid);

    const name =
      row?.name ?? (sid === data.student?.id ? data.student.name : sid);
    const email =
      row?.email ??
      (sid === data.student?.id ? data.student.email : `${sid}@unknown.local`);

    return {
      id: sid,
      name,
      email,
      initials: toInitials(name),
      submittedAt: toRelative(sub?.submitted_at ?? sub?.started_at),
      status:
        sub?.final_score !== null && sub?.final_score !== undefined
          ? "Дүгнэгдсэн"
          : "Хүлээгдэж байна",
      mcScore: sub?.score_auto ?? 0,
      finalScore: sub?.final_score ?? null,
      mcTotal: sub?.exam_id ? (classExamTotalById.get(sub.exam_id) ?? 0) : 0,
      essays: [],
    } satisfies Student;
  });

  const latest = classSubs
    .filter((s) => s.student_id === studentId)
    .sort((a, b) => {
      const at = new Date(a.submitted_at ?? a.started_at ?? 0).getTime();
      const bt = new Date(b.submitted_at ?? b.started_at ?? 0).getTime();
      return bt - at;
    })[0];
  const latestExamTotal = latest?.exam_id
    ? (classExamTotalById.get(latest.exam_id) ?? 0)
    : 0;
  const questionPointsById = latest?.exam_id
    ? await getExamQuestionPoints(latest.exam_id)
    : new Map<string, number>();

  const examQuestionData = latest?.exam_id
    ? await gql<{
        exam: {
          id: string;
          title?: string | null;
          questions?: Question[] | null;
        } | null;
      }>(EXAM_DETAIL_QUERY, { examId: latest.exam_id })
    : { exam: null };

  const questions = (examQuestionData.exam?.questions ?? [])
    .filter((q): q is Question => Boolean(q?.id && q?.text))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const answerMap = new Map(
    (latest?.answers ?? []).map((a) => [String(a.question_id), a]),
  );

  const manualQuestions = questions.filter((q) => {
    const answer = answerMap.get(String(q.id));
    const hasTextAnswer = Boolean(answer?.text_answer?.trim());
    return isManualQuestionType(q.type) || hasTextAnswer;
  });

  const questionById = new Map(questions.map((q) => [String(q.id), q]));
  const fallbackManualQuestions =
    manualQuestions.length > 0
      ? manualQuestions
      : (latest?.answers ?? [])
          .filter((a) => Boolean(a.text_answer?.trim()))
          .map((a, idx) => ({
            id: String(a.question_id),
            text:
              questionById.get(String(a.question_id))?.text ??
              `Асуулт ${idx + 1}`,
            image_url:
              questionById.get(String(a.question_id))?.image_url ?? null,
            type: "written",
            order_index: idx,
          }));

  const manualQuestionIds = new Set(
    fallbackManualQuestions.map((question) => String(question.id)),
  );
  const latestManualTotal = Array.from(manualQuestionIds).reduce(
    (sum, questionId) => sum + (questionPointsById.get(questionId) ?? 0),
    0,
  );
  const latestMcTotal = Math.max(latestExamTotal - latestManualTotal, 0);

  const essays: EssayQuestion[] = fallbackManualQuestions.map((q, idx) => {
    const answer = answerMap.get(String(q.id));
    const maxScoreForQuestion = questionPointsById.get(String(q.id)) ?? 5;

    return {
      id: idx + 1,
      questionId: q.id,
      submissionAnswerId: answer?.id ?? null,
      question: q.text,
      questionImageUrl: q.image_url ?? null,
      studentAnswer: answer?.text_answer ?? "",
      rubric: DEFAULT_RUBRIC.map((r) => ({
        ...r,
        maxScore: Math.max(1, maxScoreForQuestion),
        score: clampScore(answer?.score, Math.max(1, maxScoreForQuestion)),
      })),
      feedback: answer?.feedback ?? "",
    };
  });

  const student: Student = {
    id: data.student.id,
    name: data.student.name,
    email: data.student.email,
    initials: toInitials(data.student.name),
    submittedAt: toRelative(latest?.submitted_at ?? latest?.started_at),
    status:
      latest?.final_score !== null && latest?.final_score !== undefined
        ? "Дүгнэгдсэн"
        : "Хүлээгдэж байна",
    mcScore: latest?.score_auto ?? 0,
    finalScore: latest?.final_score ?? null,
    mcTotal: latestMcTotal,
    essays,
  };

  return {
    course: {
      id: data.course.id,
      code: data.course.code,
      name: data.course.name,
      assignmentLabel: data.course.exams?.[0]?.title ?? "Шалгалт",
      pending: classStudents.filter((s) => s.status === "Хүлээгдэж байна")
        .length,
      graded: classStudents.filter((s) => s.status === "Дүгнэгдсэн").length,
      total: classStudentIds.size,
    },
    classStudents,
    student,
    submissionId: latest?.id ?? null,
  };
}

export async function saveSubmissionScore(
  submissionId: string,
  score: number,
): Promise<void> {
  await gql<{ updateSubmission: { id: string } }>(
    `
    mutation SaveScore($id: String!, $final_score: Int) {
      updateSubmission(id: $id, final_score: $final_score) { id }
    }
    `,
    { id: submissionId, final_score: Math.round(score) },
  );
}

export async function publishSubmissionGrade(
  submissionId: string,
  finalScore: number,
  manualScore = 0,
): Promise<void> {
  await gql<{ updateSubmission: { id: string } }>(
    `
    mutation PublishSubmissionGrade(
      $id: String!
      $final_score: Int
      $score_manual: Int
      $status: SubmissionStatus
    ) {
      updateSubmission(
        id: $id
        final_score: $final_score
        score_manual: $score_manual
        status: $status
      ) {
        id
      }
    }
    `,
    {
      id: submissionId,
      final_score: Math.round(finalScore),
      score_manual: Math.round(manualScore),
      status: "reviewed",
    },
  );
}

type EssayReviewInput = {
  questionId: string;
  submissionAnswerId?: string | null;
  score: number;
  feedback: string;
};

export async function saveEssayReviews(
  submissionId: string,
  reviews: EssayReviewInput[],
): Promise<void> {
  await Promise.all(
    reviews.map((review) => {
      const roundedScore = Math.round(review.score);

      if (review.submissionAnswerId) {
        return gql<{ updateSubmissionAnswer: { id: string } }>(
          `
          mutation UpdateSubmissionAnswer(
            $id: String!
            $score: Int
            $feedback: String
          ) {
            updateSubmissionAnswer(
              id: $id
              score: $score
              feedback: $feedback
            ) { id }
          }
          `,
          {
            id: review.submissionAnswerId,
            score: roundedScore,
            feedback: review.feedback,
          },
        );
      }

      return gql<{ createSubmissionAnswer: { id: string } }>(
        `
        mutation CreateSubmissionAnswer(
          $submission_id: String!
          $question_id: String!
          $score: Int
          $feedback: String
        ) {
          createSubmissionAnswer(
            submission_id: $submission_id
            question_id: $question_id
            score: $score
            feedback: $feedback
          ) { id }
        }
        `,
        {
          submission_id: submissionId,
          question_id: review.questionId,
          score: roundedScore,
          feedback: review.feedback,
        },
      );
    }),
  );
}
