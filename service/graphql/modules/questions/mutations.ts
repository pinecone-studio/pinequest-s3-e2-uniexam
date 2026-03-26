import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

type CreateQuestionArgs = {
  exam_id: string;
  text: string;
  type: string;
  order_index: number;
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
      exam_id?: string;
      text?: string;
      type?: string;
      order_index?: number;
    },
  ) => {
    const payload = pickDefined({
      exam_id: args.exam_id,
      text: args.text,
      type: args.type,
      order_index: args.order_index,
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
};
