// import { pickDefined } from "@/graphql/shared";
// import { supabase } from "@/lib/supabase";

// export const enrollmentMutations = {
//   createEnrollment: async (
//     _: unknown,
//     args: { student_id: string; course_id: string },
//   ) => {
//     const { data, error } = await supabase
//       .from("enrollments")
//       .insert([{ student_id: args.student_id, course_id: args.course_id }])
//       .select()
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },
//   updateEnrollment: async (
//     _: unknown,
//     args: { id: string; student_id?: string; course_id?: string },
//   ) => {
//     const payload = pickDefined({
//       student_id: args.student_id,
//       course_id: args.course_id,
//     });

//     const { data, error } = await supabase
//       .from("enrollments")
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

const ENROLLMENTS_CACHE_KEY = "enrollments";
const ENROLLMENT_CACHE_KEY = (id: string) => `enrollment:${id}`;

async function invalidateEnrollmentCache(enrollmentId?: string) {
  await redis.del(ENROLLMENTS_CACHE_KEY);
  if (enrollmentId) await redis.del(ENROLLMENT_CACHE_KEY(enrollmentId));
}

export const enrollmentMutations = {
  createEnrollment: async (
    _: unknown,
    args: { student_id: string; course_id: string },
  ) => {
    const { data, error } = await supabase
      .from("enrollments")
      .insert([{ student_id: args.student_id, course_id: args.course_id }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    await invalidateEnrollmentCache(data?.id);
    return data;
  },

  updateEnrollment: async (
    _: unknown,
    args: { id: string; student_id?: string; course_id?: string },
  ) => {
    const payload = pickDefined({
      student_id: args.student_id,
      course_id: args.course_id,
    });

    const { data, error } = await supabase
      .from("enrollments")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await invalidateEnrollmentCache(args.id);
    return data;
  },
};
