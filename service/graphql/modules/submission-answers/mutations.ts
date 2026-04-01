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

async function assertSubmissionWritable(submissionId: string) {
  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("id", submissionId)
    .maybeSingle();

  if (subErr) throw new Error(subErr.message);
  if (!sub) throw new Error("Submission not found");

  // Deadline enforcement happens when the submission is finalized so
  // answers are not dropped if the student submits at the exact cutoff.
  if (sub.status !== "in_progress") {
    throw new Error("Submission is not editable");
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
