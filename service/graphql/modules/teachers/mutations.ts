import { supabase } from "@/lib/supabase";
import { pickDefined } from "../../shared";

export const teacherMutations = {
  createTeacher: async (_: unknown, args: { name: string; email: string }) => {
    const { data, error } = await supabase
      .from("teacher")
      .insert([{ name: args.name, email: args.email }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  updateTeacher: async (
    _: unknown,
    args: { id: string; name?: string; email?: string },
  ) => {
    const payload = pickDefined({ name: args.name, email: args.email });

    const { data, error } = await supabase
      .from("teacher")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
