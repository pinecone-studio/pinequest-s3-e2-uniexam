// import { supabase } from "@/lib/supabase";

// export const courseQueries = {
//   courses: async () => {
//     const { data, error } = await supabase.from("courses").select("*");
//     if (error) throw new Error(error.message);
//     return data;
//   },
//   course: async (_: unknown, args: { id: string }) => {
//     const { data, error } = await supabase
//       .from("courses")
//       .select("*")
//       .eq("id", args.id)
//       .single();
//     if (error) throw new Error(error.message);
//     return data;
//   },
//   courseByCode: async (_: unknown, args: { code: string }) => {
//     const { data, error } = await supabase
//       .from("courses")
//       .select("*")
//       .eq("code", args.code)
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },
// };

import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";

const COURSES_CACHE_KEY = "courses";
const COURSE_CACHE_KEY = (id: string) => `course:${id}`;

export const courseQueries = {
  courses: async () => {
    const cached = await redis.get(COURSES_CACHE_KEY);
    if (cached) return cached;

    const { data, error } = await supabase.from("courses").select("*");
    if (error) throw new Error(error.message);

    await redis.set(COURSES_CACHE_KEY, data, { ex: 120 });
    return data;
  },

  course: async (_: unknown, args: { id: string }) => {
    const cacheKey = COURSE_CACHE_KEY(args.id);
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", args.id)
      .single();
    if (error) throw new Error(error.message);

    await redis.set(cacheKey, data, { ex: 300 });
    return data;
  },

  courseByCode: async (_: unknown, args: { code: string }) => {
    const cacheKey = `course:code:${args.code}`;
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("code", args.code)
      .single();

    if (error) throw new Error(error.message);

    await redis.set(cacheKey, data, { ex: 300 });
    return data;
  },
};
