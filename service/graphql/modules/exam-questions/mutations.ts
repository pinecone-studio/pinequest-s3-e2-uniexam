// import { pickDefined } from "@/graphql/shared";
// import { supabase } from "@/lib/supabase";

// export const examQuestionMutations = {
//   addExamQuestion: async (
//     _: unknown,
//     args: {
//       exam_id: string;
//       question_id: string;
//       order_index: number;
//       points: number;
//     },
//   ) => {
//     const { data, error } = await supabase
//       .from("exam_questions")
//       .insert([args])
//       .select()
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },

//   updateExamQuestion: async (
//     _: unknown,
//     args: { id: string; order_index?: number; points?: number },
//   ) => {
//     const payload = pickDefined({
//       order_index: args.order_index,
//       points: args.points,
//     });

//     const { data, error } = await supabase
//       .from("exam_questions")
//       .update(payload)
//       .eq("id", args.id)
//       .select()
//       .single();

//     if (error) throw new Error(error.message);
//     return data;
//   },

//   deleteExamQuestion: async (_: unknown, args: { id: string }) => {
//     const { error } = await supabase
//       .from("exam_questions")
//       .delete()
//       .eq("id", args.id);

//     if (error) throw new Error(error.message);
//     return true;
//   },
// };

import { pickDefined } from "@/graphql/shared";
import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

const EXAM_QUESTIONS_CACHE_KEY = (examId: string) =>
  `rel:exam:${examId}:questions`;

async function invalidateExamQuestionsRelation(examId?: string | null) {
  if (!examId) return;
  await redis.del(EXAM_QUESTIONS_CACHE_KEY(examId));
}

export const examQuestionMutations = {
  addExamQuestion: async (
    _: unknown,
    args: {
      exam_id: string;
      question_id: string;
      order_index: number;
      points: number;
    },
  ) => {
    const { data, error } = await supabase
      .from("exam_questions")
      .insert([args])
      .select()
      .single();

    if (error) throw new Error(error.message);
    await invalidateExamQuestionsRelation(args.exam_id);
    return data;
  },

  updateExamQuestion: async (
    _: unknown,
    args: { id: string; order_index?: number; points?: number },
  ) => {
    const { data: before, error: beforeErr } = await supabase
      .from("exam_questions")
      .select("exam_id")
      .eq("id", args.id)
      .maybeSingle();
    if (beforeErr) throw new Error(beforeErr.message);

    const payload = pickDefined({
      order_index: args.order_index,
      points: args.points,
    });

    const { data, error } = await supabase
      .from("exam_questions")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    await invalidateExamQuestionsRelation(before?.exam_id);
    return data;
  },

  deleteExamQuestion: async (_: unknown, args: { id: string }) => {
    const { data: before, error: beforeErr } = await supabase
      .from("exam_questions")
      .select("exam_id")
      .eq("id", args.id)
      .maybeSingle();
    if (beforeErr) throw new Error(beforeErr.message);

    const { error } = await supabase
      .from("exam_questions")
      .delete()
      .eq("id", args.id);

    if (error) throw new Error(error.message);
    await invalidateExamQuestionsRelation(before?.exam_id);
    return true;
  },
};
