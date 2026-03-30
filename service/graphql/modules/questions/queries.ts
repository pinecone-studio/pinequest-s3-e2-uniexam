import { supabase } from "@/lib/supabase";

export const questionQueries = {
  questions: async () => {
    const { data, error } = await supabase.from("questions").select("*");
    if (error) throw new Error(error.message);
    return data;
  },

  question: async (_: unknown, args: { id: string }) => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", args.id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
