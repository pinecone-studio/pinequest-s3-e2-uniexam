// import { pickDefined } from "@/graphql/shared";
// import { supabase } from "@/lib/supabase";

// export const courseMutations = {
//   createCourse: async (
//     _: unknown,
//     args: { name: string; code: string; teacher_id: string },
//   ) => {
//     const { data, error } = await supabase
//       .from("courses")
//       .insert([
//         { name: args.name, code: args.code, teacher_id: args.teacher_id },
//       ])
//       .select()
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },
//   updateCourse: async (
//     _: unknown,
//     args: { id: string; name?: string; code?: string; teacher_id?: string },
//   ) => {
//     const payload = pickDefined({
//       name: args.name,
//       code: args.code,
//       teacher_id: args.teacher_id,
//     });

//     const { data, error } = await supabase
//       .from("courses")
//       .update(payload)
//       .eq("id", args.id)
//       .select()
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },
// };

import { pickDefined } from "@/graphql/shared";
import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

const COURSES_CACHE_KEY = "courses";
const COURSE_CACHE_KEY = (id: string) => `course:${id}`;
const COURSE_BY_CODE_CACHE_KEY = (code: string) => `course:code:${code}`;

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

    await redis.del(COURSES_CACHE_KEY);
    if (data?.id) await redis.del(COURSE_CACHE_KEY(data.id));
    if (data?.code) await redis.del(COURSE_BY_CODE_CACHE_KEY(data.code));

    return data;
  },

  updateCourse: async (
    _: unknown,
    args: { id: string; name?: string; code?: string; teacher_id?: string },
  ) => {
    const { data: before } = await supabase
      .from("courses")
      .select("id, code")
      .eq("id", args.id)
      .maybeSingle();

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

    await redis.del(COURSES_CACHE_KEY);
    await redis.del(COURSE_CACHE_KEY(args.id));
    if (before?.code) await redis.del(COURSE_BY_CODE_CACHE_KEY(before.code));
    if (data?.code) await redis.del(COURSE_BY_CODE_CACHE_KEY(data.code));

    return data;
  },
};
