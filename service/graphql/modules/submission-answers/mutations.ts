import { supabase } from "@/lib/supabase";

type CreateSubmissionAnswerArgs = {
  submission_id: string;
  question_id: string;
  answer_id?: string;
  text_answer?: string;
};

export const submissionAnswerMutations = {
  createSubmissionAnswer: async (
    _: unknown,
    args: CreateSubmissionAnswerArgs,
  ) => {
    const { data, error } = await supabase
      .from("submission_answers")
      .insert([args])
      .select()
      .single();

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
    },
  ) => {
    const payload = pickDefined({
      submission_id: args.submission_id,
      question_id: args.question_id,
      answer_id: args.answer_id,
      text_answer: args.text_answer,
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
