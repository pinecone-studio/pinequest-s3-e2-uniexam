import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

export const courseMutations = {
  createCourse: async (
    _: unknown,
    args: { name: string; code: string; teacher_id: string },
  ) => {
    const { data, error } = await supabase
      .from("courses")
      .insert([
        { name: args.name, code: args.code, teacher_id: args.teacher_id },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  updateCourse: async (
    _: unknown,
    args: { id: string; name?: string; code?: string; teacher_id?: string },
  ) => {
    const payload = pickDefined({
      name: args.name,
      code: args.code,
      teacher_id: args.teacher_id,
    });

    const { data, error } = await supabase
      .from("courses")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
