import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

type CreateSubmissionAnswerArgs = {
  submission_id: string;
  question_id: string;
  answer_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
};

function parseDate(value: string, field: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid ${field}`);
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

async function assertSubmissionWritable(submissionId: string) {
  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .select("id, status, started_at, submitted_at, exam_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (subErr) throw new Error(subErr.message);
  if (!sub) throw new Error("Submission not found");

  if (sub.status !== "in_progress") {
    throw new Error("Submission is not editable");
  }

  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .select("end_time, duration")
    .eq("id", sub.exam_id)
    .maybeSingle();

  if (examErr) throw new Error(examErr.message);
  if (!exam) throw new Error("Exam not found");

  const startedAt = parseDate(sub.started_at, "submission started_at");
  const examEnd = parseDate(exam.end_time, "exam end_time");
  const duration = Number(exam.duration ?? 0);
  if (duration <= 0) throw new Error("Exam duration must be greater than 0");

  const effectiveEnd = computeEffectiveEnd(startedAt, examEnd, duration);
  const now = new Date();

  if (now >= effectiveEnd) {
    // хугацаа дуусмагц автоматаар submitted болгоно
    const { error: autoErr } = await supabase
      .from("submissions")
      .update({
        status: "submitted",
        submitted_at: sub.submitted_at ?? now.toISOString(),
      })
      .eq("id", submissionId);

    if (autoErr) throw new Error(autoErr.message);
    throw new Error("Exam time is over. Submission has been auto-submitted.");
  }
}

export const submissionAnswerMutations = {
  createSubmissionAnswer: async (
    _: unknown,
    args: CreateSubmissionAnswerArgs,
  ) => {
    await assertSubmissionWritable(args.submission_id);

    const { data, error } = await supabase
      .from("submission_answers")
      .insert([args])
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  updateSubmissionAnswer: async (
    _: unknown,
    args: {
      id: string;
      submission_id?: string;
      question_id?: string;
      answer_id?: string;
      text_answer?: string;
      is_correct?: boolean;
      score?: number;
      feedback?: string;
    },
  ) => {
    let submissionId = args.submission_id;

    if (!submissionId) {
      const { data: row, error: rowErr } = await supabase
        .from("submission_answers")
        .select("submission_id")
        .eq("id", args.id)
        .maybeSingle();

      if (rowErr) throw new Error(rowErr.message);
      if (!row) throw new Error("SubmissionAnswer not found");
      submissionId = row.submission_id;
    }
    if (!submissionId) {
      throw new Error("Submission ID is required");
    }

    await assertSubmissionWritable(submissionId);

    const payload = pickDefined({
      submission_id: args.submission_id,
      question_id: args.question_id,
      answer_id: args.answer_id,
      text_answer: args.text_answer,
      is_correct: args.is_correct,
      score: args.score,
      feedback: args.feedback,
    });

    const { data, error } = await supabase
      .from("submission_answers")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
