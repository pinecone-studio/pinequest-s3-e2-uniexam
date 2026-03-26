import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

type CreateAnswerArgs = {
  question_id: string;
  text: string;
  is_correct: boolean;
};

export const answerMutations = {
  createAnswer: async (_: unknown, args: CreateAnswerArgs) => {
    const { data, error } = await supabase
      .from("answers")
      .insert([args])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  updateAnswer: async (
    _: unknown,
    args: {
      id: string;
      question_id?: string;
      text?: string;
      is_correct?: boolean;
    },
  ) => {
    const payload = pickDefined({
      question_id: args.question_id,
      text: args.text,
      is_correct: args.is_correct,
    });

    const { data, error } = await supabase
      .from("answers")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
