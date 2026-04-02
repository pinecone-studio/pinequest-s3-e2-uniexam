// import { supabase } from "@/lib/supabase";
// import { pickDefined } from "../../shared";

// export const studentMutations = {
//   createStudent: async (_: unknown, args: { name: string; email: string }) => {
//     const { data, error } = await supabase
//       .from("students")
//       .insert([{ name: args.name, email: args.email }])
//       .select()
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },
//   updateStudent: async (
//     _: unknown,
//     args: { id: string; name?: string; email?: string },
//   ) => {
//     const payload = pickDefined({ name: args.name, email: args.email });

//     const { data, error } = await supabase
//       .from("students")
//       .update(payload)
//       .eq("id", args.id)
//       .select()
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },
// };

import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";
import { pickDefined } from "../../shared";

const STUDENTS_CACHE_KEY = "students";
const STUDENT_CACHE_KEY = (id: string) => `student:${id}`;
const STUDENT_BY_EMAIL_CACHE_KEY = (email: string) => `student:email:${email}`;

async function invalidateStudentCache(params: {
  id?: string;
  oldEmail?: string | null;
  newEmail?: string | null;
}) {
  await redis.del(STUDENTS_CACHE_KEY);

  if (params.id) {
    await redis.del(STUDENT_CACHE_KEY(params.id));
  }

  if (params.oldEmail) {
    await redis.del(STUDENT_BY_EMAIL_CACHE_KEY(params.oldEmail));
  }

  if (params.newEmail) {
    await redis.del(STUDENT_BY_EMAIL_CACHE_KEY(params.newEmail));
  }
}

export const studentMutations = {
  createStudent: async (_: unknown, args: { name: string; email: string }) => {
    const { data, error } = await supabase
      .from("students")
      .insert([{ name: args.name, email: args.email }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    await invalidateStudentCache({
      id: data?.id,
      newEmail: data?.email ?? args.email,
    });

    return data;
  },

  updateStudent: async (
    _: unknown,
    args: { id: string; name?: string; email?: string },
  ) => {
    const { data: before } = await supabase
      .from("students")
      .select("id, email")
      .eq("id", args.id)
      .maybeSingle();

    const payload = pickDefined({ name: args.name, email: args.email });

    const { data, error } = await supabase
      .from("students")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await invalidateStudentCache({
      id: args.id,
      oldEmail: before?.email ?? null,
      newEmail: data?.email ?? args.email ?? null,
    });

    return data;
  },
};
