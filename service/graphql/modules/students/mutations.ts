import { supabase } from "@/lib/supabase";
import { pickDefined } from "../../shared";

export const studentMutations = {
  createStudent: async (_: unknown, args: { name: string; email: string }) => {
    const { data, error } = await supabase
      .from("students")
      .insert([{ name: args.name, email: args.email }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  updateStudent: async (
    _: unknown,
    args: { id: string; name?: string; email?: string },
  ) => {
    const payload = pickDefined({ name: args.name, email: args.email });

    const { data, error } = await supabase
      .from("students")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
