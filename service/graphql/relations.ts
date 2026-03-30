import { supabase } from "@/lib/supabase";

export const relationResolvers = {
  Course: {
    exams: async (parent: { id: string }) => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("course_id", parent.id);

      if (error) throw new Error(error.message);
      return data;
    },
  },

  Exam: {
    course: async (parent: { course_id: string }) => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", parent.course_id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    },
    questions: async (parent: { id: string }) => {
      // questions table has no exam_id — join through exam_questions
      const { data: eq, error: eqErr } = await supabase
        .from("exam_questions")
        .select("question_id, order_index")
        .eq("exam_id", parent.id)
        .order("order_index", { ascending: true });

      if (eqErr) throw new Error(eqErr.message);
      if (!eq || eq.length === 0) return [];

      const questionIds = eq.map((r: { question_id: string }) => r.question_id);

      const { data: questions, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .in("id", questionIds);

      if (qErr) throw new Error(qErr.message);

      // attach order_index from the junction row so the schema field resolves
      const orderMap = new Map(
        eq.map((r: { question_id: string; order_index: number }) => [r.question_id, r.order_index])
      );
      return (questions ?? [])
        .map((q: { id: string }) => ({ ...q, order_index: orderMap.get(q.id) ?? null }))
        .sort((a: { order_index: number | null }, b: { order_index: number | null }) =>
          (a.order_index ?? 0) - (b.order_index ?? 0)
        );
    },
  },

  Question: {
    answers: async (parent: { id: string }) => {
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", parent.id);

      if (error) throw new Error(error.message);
      return data;
    },
  },

  Submission: {
    answers: async (parent: { id: string }) => {
      const { data, error } = await supabase
        .from("submission_answers")
        .select("*")
        .eq("submission_id", parent.id);

      if (error) throw new Error(error.message);
      return data;
    },
  },
};
