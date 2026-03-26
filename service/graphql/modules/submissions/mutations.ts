import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

type CreateSubmissionArgs = {
  student_id: string;
  exam_id: string;
  started_at: string;
  submitted_at?: string;
  score?: number;
};

export const submissionMutations = {
  createSubmission: async (_: unknown, args: CreateSubmissionArgs) => {
    const { data, error } = await supabase
      .from("submissions")
      .insert([args])
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
      score?: number;
    },
  ) => {
    const payload = pickDefined({
      student_id: args.student_id,
      exam_id: args.exam_id,
      started_at: args.started_at,
      submitted_at: args.submitted_at,
      score: args.score,
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
