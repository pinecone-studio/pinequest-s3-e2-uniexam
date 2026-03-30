import { supabase } from "@/lib/supabase";

export const examQuestionQueries = {
  examQuestions: async (_: unknown, args: { exam_id: string }) => {
    const { data, error } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", args.exam_id)
      .order("order_index", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },
};
