import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

type CreateQuestionArgs = {
  text: string;
  type: string;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
};

export const questionMutations = {
  createQuestion: async (_: unknown, args: CreateQuestionArgs) => {
    const { data, error } = await supabase
      .from("questions")
      .insert([args])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateQuestion: async (
    _: unknown,
    args: {
      id: string;
      text?: string;
      type?: string;
      difficulty?: string;
      category?: string;
    },
  ) => {
    const payload = pickDefined({
      text: args.text,
      type: args.type,
      difficulty: args.difficulty,
      category: args.category,
    });

    const { data, error } = await supabase
      .from("questions")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  deleteQuestion: async (_: unknown, args: { id: string }) => {
    // Remove junction rows
    const { error: jErr } = await supabase
      .from("exam_questions")
      .delete()
      .eq("question_id", args.id);
    if (jErr) throw new Error(jErr.message);

    const { error: aErr } = await supabase
      .from("answers")
      .delete()
      .eq("question_id", args.id);
    if (aErr) throw new Error(aErr.message);

    const { error: qErr } = await supabase
      .from("questions")
      .delete()
      .eq("id", args.id);
    if (qErr) throw new Error(qErr.message);

    return true;
  },
};
