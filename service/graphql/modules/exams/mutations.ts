import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

const OPTION_COUNT = 5;

type ManualQuestionArgs = {
  content: string;
  difficulty: "easy" | "medium" | "hard";
  options: string[];
  correctOptionIndex: number;
};

async function rollbackExamInsert(examId: string) {
  const { data: qRows } = await supabase
    .from("questions")
    .select("id")
    .eq("exam_id", examId);
  const qIds = (qRows ?? []).map((r) => r.id);
  if (qIds.length > 0) {
    await supabase.from("answers").delete().in("question_id", qIds);
  }
  await supabase.from("questions").delete().eq("exam_id", examId);
  await supabase.from("exams").delete().eq("id", examId);
}

type CreateExamArgs = {
  course_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration: number;
};

export const examMutations = {
  createExam: async (_: unknown, args: CreateExamArgs) => {
    const { data, error } = await supabase
      .from("exams")
      .insert([args])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  createExamWithQuestions: async (
    _: unknown,
    args: {
      course_id: string;
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      duration: number;
      questions: Array<{ text: string; type: string; order_index: number }>;
    },
  ) => {
    const { questions, ...examPayload } = args;

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert([examPayload])
      .select()
      .single();

    if (examError) throw new Error(examError.message);

    const questionRows = questions.map((q) => ({
      exam_id: exam.id,
      text: q.text,
      type: q.type,
      order_index: q.order_index,
    }));

    const { error: qError } = await supabase
      .from("questions")
      .insert(questionRows);
    if (qError) throw new Error(qError.message);

    return exam;
  },
  saveExamManual: async (
    _: unknown,
    args: {
      course_id: string;
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      duration: number;
      questions: ManualQuestionArgs[];
    },
  ) => {
    const { questions, ...examFields } = args;

    if (!questions.length) {
      throw new Error("At least one question is required.");
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content?.trim()) {
        throw new Error(`Question ${i + 1}: content is required.`);
      }
      if (!q.options || q.options.length !== OPTION_COUNT) {
        throw new Error(
          `Question ${i + 1}: exactly ${OPTION_COUNT} options are required.`,
        );
      }
      for (let j = 0; j < OPTION_COUNT; j++) {
        if (!q.options[j]?.trim()) {
          throw new Error(
            `Question ${i + 1}: option ${j + 1} cannot be empty.`,
          );
        }
      }
      if (
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= OPTION_COUNT ||
        !Number.isInteger(q.correctOptionIndex)
      ) {
        throw new Error(
          `Question ${i + 1}: correctOptionIndex must be an integer from 0 to ${OPTION_COUNT - 1}.`,
        );
      }
    }

    const examPayload = {
      course_id: examFields.course_id,
      title: examFields.title.trim(),
      description: examFields.description?.trim() ?? null,
      start_time: examFields.start_time,
      end_time: examFields.end_time,
      duration: examFields.duration,
    };

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert([examPayload])
      .select()
      .single();

    if (examError) throw new Error(examError.message);
    if (!exam?.id) throw new Error("Exam insert did not return an id.");

    try {
      const questionRows = questions.map((q, orderIndex) => ({
        exam_id: exam.id,
        text: q.content.trim(),
        type: "multiple_choice",
        order_index: orderIndex,
        difficulty: q.difficulty,
      }));

      let insertedQuestions: { id: string; order_index: number | null }[] | null;
      {
        const first = await supabase
          .from("questions")
          .insert(questionRows)
          .select("id, order_index");
        if (first.error) {
          const msg = first.error.message?.toLowerCase() ?? "";
          const missingDifficulty = msg.includes("difficulty");
          if (missingDifficulty) {
            const withoutDifficulty = questionRows.map(
              ({ difficulty: _d, ...rest }) => rest,
            );
            const second = await supabase
              .from("questions")
              .insert(withoutDifficulty)
              .select("id, order_index");
            if (second.error) throw new Error(second.error.message);
            insertedQuestions = second.data;
          } else {
            throw new Error(first.error.message);
          }
        } else {
          insertedQuestions = first.data;
        }
      }
      if (!insertedQuestions?.length || insertedQuestions.length !== questions.length) {
        throw new Error("Failed to insert all questions.");
      }

      const byOrder = [...insertedQuestions].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
      );

      const answerRows: {
        question_id: string;
        text: string;
        is_correct: boolean;
      }[] = [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const row = byOrder[i];
        if (!row?.id) throw new Error("Missing question id after insert.");
        for (let j = 0; j < OPTION_COUNT; j++) {
          answerRows.push({
            question_id: row.id,
            text: q.options[j].trim(),
            is_correct: j === q.correctOptionIndex,
          });
        }
      }

      const { error: aErr } = await supabase.from("answers").insert(answerRows);
      if (aErr) throw new Error(aErr.message);

      return exam;
    } catch (e) {
      await rollbackExamInsert(exam.id);
      throw e instanceof Error ? e : new Error(String(e));
    }
  },
  updateExam: async (
    _: unknown,
    args: {
      id: string;
      course_id?: string;
      title?: string;
      description?: string;
      start_time?: string;
      end_time?: string;
      duration?: number;
    },
  ) => {
    const payload = pickDefined({
      course_id: args.course_id,
      title: args.title,
      description: args.description,
      start_time: args.start_time,
      end_time: args.end_time,
      duration: args.duration,
    });

    const { data, error } = await supabase
      .from("exams")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
