import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

type SubmissionStatus = "in_progress" | "submitted" | "reviewed";

type CreateSubmissionArgs = {
  student_id: string;
  exam_id: string;
  started_at: string;
  submitted_at?: string;
  status?: SubmissionStatus;
  attempt_number?: number;
  score_auto?: number;
  score_manual?: number;
  final_score?: number;
};

const EXAM_AUTO_SUBMITTED_ERROR =
  "Exam time is over. Submission has been auto-submitted.";

function isValidTransition(
  from: SubmissionStatus | null,
  to: SubmissionStatus,
): boolean {
  if (from === to) return true;
  if (from === "in_progress" && to === "submitted") return true;
  if (from === "submitted" && to === "reviewed") return true;
  return false;
}

function parseDate(value: string, field: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ${field}`);
  }
  return d;
}

function computeEffectiveEnd(
  startedAt: Date,
  examEnd: Date,
  durationMinutes: number,
): Date {
  const byDuration = new Date(
    startedAt.getTime() + durationMinutes * 60 * 1000,
  );
  return byDuration < examEnd ? byDuration : examEnd;
}

async function getExamTiming(examId: string) {
  const { data, error } = await supabase
    .from("exams")
    .select("id, start_time, end_time, duration")
    .eq("id", examId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Exam not found");

  const start = parseDate(data.start_time, "exam start_time");
  const end = parseDate(data.end_time, "exam end_time");
  const duration = Number(data.duration ?? 0);

  if (duration <= 0) throw new Error("Exam duration must be greater than 0");
  if (end <= start) throw new Error("Exam end_time must be after start_time");

  return { start, end, duration };
}

async function maybeAutoSubmitExpiredSubmission(
  submissionId: string,
  current: {
    status: SubmissionStatus | null;
    started_at: string;
    submitted_at: string | null;
    exam_id: string;
  },
) {
  if (current.status !== "in_progress") {
    return false;
  }

  const { end, duration } = await getExamTiming(current.exam_id);
  const startedAt = parseDate(current.started_at, "submission started_at");
  const effectiveEnd = computeEffectiveEnd(startedAt, end, duration);
  const now = new Date();

  if (now < effectiveEnd) {
    return false;
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "submitted",
      submitted_at: current.submitted_at ?? now.toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export const submissionMutations = {
  createSubmission: async (_: unknown, args: CreateSubmissionArgs) => {
    const { start, end } = await getExamTiming(args.exam_id);
    const now = new Date();

    if (now < start) throw new Error("Exam has not started yet");
    if (now >= end) throw new Error("Exam has already ended");

    const payload = {
      ...args,
      // Шалгалтын хугацааг товлосон эхлэх цагаас тооцно.
      started_at: start.toISOString(),
      status: args.status ?? "in_progress",
      attempt_number: args.attempt_number ?? 1,
    };

    const { data, error } = await supabase
      .from("submissions")
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateSubmission: async (
    _: unknown,
    args: {
      id: string;
      student_id?: string;
      exam_id?: string;
      started_at?: string;
      submitted_at?: string;
      status?: SubmissionStatus;
      attempt_number?: number;
      score_auto?: number;
      score_manual?: number;
      final_score?: number;
    },
  ) => {
    const { data: current, error: currentErr } = await supabase
      .from("submissions")
      .select("status, started_at, submitted_at, exam_id")
      .eq("id", args.id)
      .maybeSingle();

    if (currentErr) throw new Error(currentErr.message);
    if (!current) throw new Error("Submission not found");

    if (args.status) {
      const from = (current.status ?? null) as SubmissionStatus | null;
      const to = args.status;

      if (!isValidTransition(from, to)) {
        throw new Error(`Invalid status transition: ${from} -> ${to}`);
      }
    }

    if (
      await maybeAutoSubmitExpiredSubmission(args.id, {
        status: (current.status ?? null) as SubmissionStatus | null,
        started_at: current.started_at,
        submitted_at: current.submitted_at,
        exam_id: current.exam_id,
      })
    ) {
      throw new Error(EXAM_AUTO_SUBMITTED_ERROR);
    }

    const payload = pickDefined({
      student_id: args.student_id,
      exam_id: args.exam_id,
      started_at: args.started_at,
      submitted_at:
        args.status === "submitted" && !args.submitted_at
          ? new Date().toISOString()
          : args.submitted_at,
      status: args.status,
      attempt_number: args.attempt_number,
      score_auto: args.score_auto,
      score_manual: args.score_manual,
      final_score: args.final_score,
    });

    const { data, error } = await supabase
      .from("submissions")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
