// import { pickDefined } from "@/graphql/shared";
// import { supabase } from "@/lib/supabase";

// type CreateAnswerArgs = {
//   question_id: string;
//   text: string;
//   is_correct: boolean;
// };

// export const answerMutations = {
//   createAnswer: async (_: unknown, args: CreateAnswerArgs) => {
//     const { data, error } = await supabase
//       .from("answers")
//       .insert([args])
//       .select()
//       .single();
//     if (error) throw new Error(error.message);
//     return data;
//   },
//   updateAnswer: async (
//     _: unknown,
//     args: {
//       id: string;
//       question_id?: string;
//       text?: string;
//       is_correct?: boolean;
//     },
//   ) => {
//     const payload = pickDefined({
//       question_id: args.question_id,
//       text: args.text,
//       is_correct: args.is_correct,
//     });

//     const { data, error } = await supabase
//       .from("answers")
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

type CreateAnswerArgs = {
  question_id: string;
  text: string;
  is_correct: boolean;
};

const QUESTION_ANSWERS_CACHE_KEY = (questionId: string) =>
  `rel:question:${questionId}:answers`;

async function invalidateQuestionAnswersRelation(questionId?: string | null) {
  if (!questionId) return;
  await redis.del(QUESTION_ANSWERS_CACHE_KEY(questionId));
}

export const answerMutations = {
  createAnswer: async (_: unknown, args: CreateAnswerArgs) => {
    const { data, error } = await supabase
      .from("answers")
      .insert([args])
      .select()
      .single();
    if (error) throw new Error(error.message);

    await invalidateQuestionAnswersRelation(args.question_id);
    return data;
  },

  updateAnswer: async (
    _: unknown,
    args: {
      id: string;
      question_id?: string;
      text?: string;
      is_correct?: boolean;
    },
  ) => {
    const { data: before, error: beforeErr } = await supabase
      .from("answers")
      .select("question_id")
      .eq("id", args.id)
      .maybeSingle();
    if (beforeErr) throw new Error(beforeErr.message);

    const payload = pickDefined({
      question_id: args.question_id,
      text: args.text,
      is_correct: args.is_correct,
    });

    const { data, error } = await supabase
      .from("answers")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await invalidateQuestionAnswersRelation(before?.question_id);
    await invalidateQuestionAnswersRelation(data?.question_id);
    return data;
  },
};
