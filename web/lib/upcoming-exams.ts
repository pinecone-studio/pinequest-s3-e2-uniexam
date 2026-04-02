import { isHiddenStudentExam } from "@/lib/exam-visibility";

export type ExamCourse = {
  id: string;
  name: string;
  code: string;
  exams: {
    id: string;
    title: string;
    start_time: string | null;
    end_time: string | null;
    duration: number | null;
    type: string;
  }[];
};

export type ExamSubmissionSummary = {
  exam_id: string;
  student_id: string;
  status: "in_progress" | "submitted" | "reviewed" | null;
};

export type UpcomingExamCard = {
  id: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  duration: number | null;
  hasKnownStartTime: boolean;
  startsAt: string;
  endsAt: string;
};

export const parseExamDate = (value: string | null | undefined) => {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const formatExamDate = (value: string | null | undefined) => {
  const parsed = parseExamDate(value);

  if (!parsed) {
    return "0000-00-00";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
};

export const formatExamTime = (value: string | null | undefined) => {
  const parsed = parseExamDate(value);

  if (!parsed) {
    return "00:00";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

export const getExamDurationLabel = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return "Үргэлжлэх хугацаа тодорхойгүй";
  }

  return `Нийт ${value} минут үргэлжилнэ`;
};

export const getExamEndsAt = (exam: UpcomingExamCard) => {
  const startsAt = parseExamDate(exam.startsAt);

  if (
    startsAt &&
    typeof exam.duration === "number" &&
    !Number.isNaN(exam.duration) &&
    exam.duration > 0
  ) {
    return new Date(startsAt.getTime() + exam.duration * 60 * 1000);
  }

  const explicitEnd = parseExamDate(exam.endsAt);

  if (explicitEnd) {
    return explicitEnd;
  }

  return null;
};

export const isExamExpired = (exam: UpcomingExamCard, currentTime: number) => {
  const endsAt = getExamEndsAt(exam);

  if (!endsAt) {
    return false;
  }

  return endsAt.getTime() < currentTime;
};

export const canStartExam = (exam: UpcomingExamCard, currentTime: number) => {
  const startsAt = parseExamDate(exam.startsAt);

  if (!startsAt) {
    return false;
  }

  if (isExamExpired(exam, currentTime)) {
    return false;
  }

  return startsAt.getTime() <= currentTime;
};

export const getExamStartAvailabilityMessage = (
  exam: UpcomingExamCard,
  currentTime: number,
) => {
  const startsAt = parseExamDate(exam.startsAt);

  if (!startsAt) {
    return "Эхлэх хугацаа тодорхойгүй";
  }

  if (startsAt.getTime() > currentTime) {
    return "Шалгалт өгөх хугацаа болоогүй байна";
  }

  return null;
};

export const buildUpcomingExamCards = (courses: ExamCourse[]) =>
  courses
    .flatMap((course) =>
      (course.exams ?? [])
        .filter((exam) => !isHiddenStudentExam(exam.title))
        .map((exam) => ({
          id: exam.id,
          subject: course.name || course.code,
          title: exam.title,
          date: formatExamDate(exam.start_time),
          time: formatExamTime(exam.start_time),
          duration: exam.duration,
          hasKnownStartTime: Boolean(parseExamDate(exam.start_time)),
          startsAt: exam.start_time ?? "",
          endsAt: exam.end_time ?? "",
        })),
    )
    .sort(
      (left, right) =>
        (parseExamDate(left.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (parseExamDate(right.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER),
    );

export const buildStudentUpcomingExamCards = (
  courses: ExamCourse[],
  submissions: ExamSubmissionSummary[],
  studentId: string | null | undefined,
) => {
  const completedExamIds = new Set(
    submissions
      .filter(
        (submission) =>
          submission.student_id === studentId &&
          (submission.status === "submitted" ||
            submission.status === "reviewed"),
      )
      .map((submission) => submission.exam_id),
  );

  return buildUpcomingExamCards(courses).filter(
    (exam) => !completedExamIds.has(exam.id),
  );
};

export const buildDashboardExamCards = (
  exams: UpcomingExamCard[],
  currentTime: number,
) => {
  const activeExams = exams.filter((exam) => canStartExam(exam, currentTime));
  const nextUpcomingExams = exams
    .filter((exam) => {
      const startsAt = parseExamDate(exam.startsAt);

      return (
        startsAt !== null &&
        startsAt.getTime() > currentTime &&
        !isExamExpired(exam, currentTime)
      );
    })
    .slice(0, 3);

  return [...activeExams, ...nextUpcomingExams];
};
