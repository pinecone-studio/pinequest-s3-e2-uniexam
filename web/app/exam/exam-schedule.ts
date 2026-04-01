import { ExamMeta } from "./exam-types";

const parseExamDate = (value: string | null | undefined) => {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const getScheduledEndsAtMs = (
  exam: Pick<ExamMeta, "durationSeconds" | "startTime" | "endTime">,
) => {
  const explicitEnd = parseExamDate(exam.endTime);
  if (explicitEnd) {
    return explicitEnd.getTime();
  }

  const scheduledStart = parseExamDate(exam.startTime);
  if (
    scheduledStart &&
    Number.isFinite(exam.durationSeconds) &&
    exam.durationSeconds > 0
  ) {
    return scheduledStart.getTime() + exam.durationSeconds * 1000;
  }

  return null;
};

export const getScheduledStartedAtIso = (
  exam: Pick<ExamMeta, "durationSeconds" | "startTime">,
  fallbackEndsAtMs?: number | null,
) => {
  const scheduledStart = parseExamDate(exam.startTime);

  if (scheduledStart) {
    return scheduledStart.toISOString();
  }

  if (
    typeof fallbackEndsAtMs === "number" &&
    Number.isFinite(fallbackEndsAtMs) &&
    Number.isFinite(exam.durationSeconds) &&
    exam.durationSeconds > 0
  ) {
    return new Date(
      fallbackEndsAtMs - exam.durationSeconds * 1000,
    ).toISOString();
  }

  return new Date().toISOString();
};
