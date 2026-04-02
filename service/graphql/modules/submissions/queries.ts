// import { supabase } from "@/lib/supabase";

// export const submissionQueries = {
//   submissions: async () => {
//     const { data, error } = await supabase.from("submissions").select("*");
//     if (error) throw new Error(error.message);
//     return data;
//   },
//   submission: async (_: unknown, args: { id: string }) => {
//     const { data, error } = await supabase
//       .from("submissions")
//       .select("*")
//       .eq("id", args.id)
//       .single();
//     if (error) throw new Error(error.message);
//     return data;
//   },
// };

import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

const SUBMISSIONS_CACHE_KEY = "submissions";
const SUBMISSION_CACHE_KEY = (id: string) => `submission:${id}`;

export const submissionQueries = {
  submissions: async () => {
    const cached = await redis.get(SUBMISSIONS_CACHE_KEY);
    if (cached) return cached;

    const { data, error } = await supabase.from("submissions").select("*");
    if (error) throw new Error(error.message);

    await redis.set(SUBMISSIONS_CACHE_KEY, data, { ex: 60 });
    return data;
  },

  submission: async (_: unknown, args: { id: string }) => {
    const cacheKey = SUBMISSION_CACHE_KEY(args.id);
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", args.id)
      .single();
    if (error) throw new Error(error.message);

    await redis.set(cacheKey, data, { ex: 120 });
    return data;
  },
};
