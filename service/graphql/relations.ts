// import { supabase } from "@/lib/supabase";

// export const relationResolvers = {
//   Course: {
//     exams: async (parent: { id: string }) => {
//       const { data, error } = await supabase
//         .from("exams")
//         .select("*")
//         .eq("course_id", parent.id);

//       if (error) throw new Error(error.message);
//       return data;
//     },
//   },

//   Exam: {
//     course: async (parent: { course_id: string }) => {
//       const { data, error } = await supabase
//         .from("courses")
//         .select("*")
//         .eq("id", parent.course_id)
//         .maybeSingle();

//       if (error) throw new Error(error.message);
//       return data;
//     },
//     questions: async (parent: { id: string }) => {
//       // questions table has no exam_id — join through exam_questions
//       const { data: eq, error: eqErr } = await supabase
//         .from("exam_questions")
//         .select("question_id, order_index")
//         .eq("exam_id", parent.id)
//         .order("order_index", { ascending: true });

//       if (eqErr) throw new Error(eqErr.message);
//       if (!eq || eq.length === 0) return [];

//       const questionIds = eq.map((r: { question_id: string }) => r.question_id);

//       const { data: questions, error: qErr } = await supabase
//         .from("questions")
//         .select("*")
//         .in("id", questionIds);

//       if (qErr) throw new Error(qErr.message);

//       // attach order_index from the junction row so the schema field resolves
//       const orderMap = new Map(
//         eq.map((r: { question_id: string; order_index: number }) => [r.question_id, r.order_index])
//       );
//       return (questions ?? [])
//         .map((q: { id: string }) => ({ ...q, order_index: orderMap.get(q.id) ?? null }))
//         .sort((a: { order_index: number | null }, b: { order_index: number | null }) =>
//           (a.order_index ?? 0) - (b.order_index ?? 0)
//         );
//     },
//   },

//   Question: {
//     answers: async (parent: { id: string }) => {
//       const { data, error } = await supabase
//         .from("answers")
//         .select("*")
//         .eq("question_id", parent.id);

//       if (error) throw new Error(error.message);
//       return data;
//     },
//   },

//   Submission: {
//     answers: async (parent: { id: string }) => {
//       const { data, error } = await supabase
//         .from("submission_answers")
//         .select("*")
//         .eq("submission_id", parent.id);

//       if (error) throw new Error(error.message);
//       return data;
//     },
//   },
// };

import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

const COURSE_EXAMS_CACHE_KEY = (courseId: string) =>
  `rel:course:${courseId}:exams`;
const EXAM_COURSE_CACHE_KEY = (examId: string) => `rel:exam:${examId}:course`;
const EXAM_QUESTIONS_CACHE_KEY = (examId: string) =>
  `rel:exam:${examId}:questions`;
const QUESTION_ANSWERS_CACHE_KEY = (questionId: string) =>
  `rel:question:${questionId}:answers`;
const SUBMISSION_ANSWERS_CACHE_KEY = (submissionId: string) =>
  `rel:submission:${submissionId}:answers`;

export const relationResolvers = {
  Course: {
    exams: async (parent: { id: string }) => {
      const cacheKey = COURSE_EXAMS_CACHE_KEY(parent.id);
      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("course_id", parent.id);

      if (error) throw new Error(error.message);

      await redis.set(cacheKey, data, { ex: 120 });
      return data;
    },
  },

  Exam: {
    course: async (parent: { id: string; course_id: string }) => {
      const cacheKey = EXAM_COURSE_CACHE_KEY(parent.id);
      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", parent.course_id)
        .maybeSingle();

      if (error) throw new Error(error.message);

      await redis.set(cacheKey, data, { ex: 300 });
      return data;
    },

    questions: async (parent: { id: string }) => {
      const cacheKey = EXAM_QUESTIONS_CACHE_KEY(parent.id);
      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      // questions table has no exam_id — join through exam_questions
      const { data: eq, error: eqErr } = await supabase
        .from("exam_questions")
        .select("question_id, order_index")
        .eq("exam_id", parent.id)
        .order("order_index", { ascending: true });

      if (eqErr) throw new Error(eqErr.message);
      if (!eq || eq.length === 0) {
        await redis.set(cacheKey, [], { ex: 120 });
        return [];
      }

      const questionIds = eq.map((r: { question_id: string }) => r.question_id);

      const { data: questions, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .in("id", questionIds);

      if (qErr) throw new Error(qErr.message);

      // attach order_index from the junction row so the schema field resolves
      const orderMap = new Map(
        eq.map((r: { question_id: string; order_index: number }) => [
          r.question_id,
          r.order_index,
        ]),
      );

      const result = (questions ?? [])
        .map((q: { id: string }) => ({
          ...q,
          order_index: orderMap.get(q.id) ?? null,
        }))
        .sort(
          (
            a: { order_index: number | null },
            b: { order_index: number | null },
          ) => (a.order_index ?? 0) - (b.order_index ?? 0),
        );

      await redis.set(cacheKey, result, { ex: 120 });
      return result;
    },
  },

  Question: {
    answers: async (parent: { id: string }) => {
      const cacheKey = QUESTION_ANSWERS_CACHE_KEY(parent.id);
      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", parent.id);

      if (error) throw new Error(error.message);

      await redis.set(cacheKey, data, { ex: 120 });
      return data;
    },
  },

  Submission: {
    answers: async (parent: { id: string }) => {
      const cacheKey = SUBMISSION_ANSWERS_CACHE_KEY(parent.id);
      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("submission_answers")
        .select("*")
        .eq("submission_id", parent.id);

      if (error) throw new Error(error.message);

      await redis.set(cacheKey, data, { ex: 60 });
      return data;
    },
  },
};
