// import { supabase } from "@/lib/supabase";

// export const enrollmentQueries = {
//   enrollments: async () => {
//     const { data, error } = await supabase.from("enrollments").select("*");
//     if (error) throw new Error(error.message);
//     return data;
//   },
//   enrollment: async (_: unknown, args: { id: string }) => {
//     const { data, error } = await supabase
//       .from("enrollments")
//       .select("*")
//       .eq("id", args.id)
//       .single();
//     if (error) throw new Error(error.message);
//     return data;
//   },
// };

import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

const ENROLLMENTS_CACHE_KEY = "enrollments";
const ENROLLMENT_CACHE_KEY = (id: string) => `enrollment:${id}`;

export const enrollmentQueries = {
  enrollments: async () => {
    const cached = await redis.get(ENROLLMENTS_CACHE_KEY);
    if (cached) return cached;

    const { data, error } = await supabase.from("enrollments").select("*");
    if (error) throw new Error(error.message);

    await redis.set(ENROLLMENTS_CACHE_KEY, data, { ex: 300 });
    return data;
  },

  enrollment: async (_: unknown, args: { id: string }) => {
    const cacheKey = ENROLLMENT_CACHE_KEY(args.id);
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("id", args.id)
      .single();
    if (error) throw new Error(error.message);

    await redis.set(cacheKey, data, { ex: 300 });
    return data;
  },
};
