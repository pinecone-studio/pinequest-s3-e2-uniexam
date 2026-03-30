import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

export const examQuestionMutations = {
  addExamQuestion: async (
    _: unknown,
    args: {
      exam_id: string;
      question_id: string;
      order_index: number;
      points: number;
    },
  ) => {
    const { data, error } = await supabase
      .from("exam_questions")
      .insert([args])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateExamQuestion: async (
    _: unknown,
    args: { id: string; order_index?: number; points?: number },
  ) => {
    const payload = pickDefined({
      order_index: args.order_index,
      points: args.points,
    });

    const { data, error } = await supabase
      .from("exam_questions")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  deleteExamQuestion: async (_: unknown, args: { id: string }) => {
    const { error } = await supabase
      .from("exam_questions")
      .delete()
      .eq("id", args.id);

    if (error) throw new Error(error.message);
    return true;
  },
};
