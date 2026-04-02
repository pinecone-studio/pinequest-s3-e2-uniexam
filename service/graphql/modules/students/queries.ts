// import { supabase } from "@/lib/supabase";

// export const studentQueries = {
//   students: async () => {
//     const { data, error } = await supabase.from("students").select("*");
//     if (error) throw new Error(error.message);
//     return data;
//   },
//   student: async (_: unknown, args: { id: string }) => {
//     const { data, error } = await supabase
//       .from("students")
//       .select("*")
//       .eq("id", args.id)
//       .single();
//     if (error) throw new Error(error.message);
//     return data;
//   },
//   studentByEmail: async (_: unknown, args: { email: string }) => {
//     const { data, error } = await supabase
//       .from("students")
//       .select("*")
//       .eq("email", args.email)
//       .maybeSingle();

//     if (error) throw new Error(error.message);
//     return data;
//   },
// };

import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

const STUDENTS_CACHE_KEY = "students";
const STUDENT_CACHE_KEY = (id: string) => `student:${id}`;
const STUDENT_BY_EMAIL_CACHE_KEY = (email: string) => `student:email:${email}`;

export const studentQueries = {
  students: async () => {
    const cached = await redis.get(STUDENTS_CACHE_KEY);
    if (cached) return cached;

    const { data, error } = await supabase.from("students").select("*");
    if (error) throw new Error(error.message);

    await redis.set(STUDENTS_CACHE_KEY, data, { ex: 300 });
    return data;
  },

  student: async (_: unknown, args: { id: string }) => {
    const cacheKey = STUDENT_CACHE_KEY(args.id);
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", args.id)
      .single();
    if (error) throw new Error(error.message);

    await redis.set(cacheKey, data, { ex: 600 });
    return data;
  },

  studentByEmail: async (_: unknown, args: { email: string }) => {
    const cacheKey = STUDENT_BY_EMAIL_CACHE_KEY(args.email);
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("email", args.email)
      .maybeSingle();

    if (error) throw new Error(error.message);

    await redis.set(cacheKey, data, { ex: 600 });
    return data;
  },
};
