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
  // Remove junction rows first
  const { data: eqRows } = await supabase
    .from("exam_questions")
    .select("question_id")
    .eq("exam_id", examId);
  const qIds = (eqRows ?? []).map((r: { question_id: string }) => r.question_id);

  await supabase.from("exam_questions").delete().eq("exam_id", examId);

  if (qIds.length > 0) {
    await supabase.from("answers").delete().in("question_id", qIds);
    await supabase.from("questions").delete().in("id", qIds);
  }
  await supabase.from("exams").delete().eq("id", examId);
}

type CreateExamArgs = {
  course_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration: number;
  type?: string;
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
      type?: string;
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

    const { data: insertedQs, error: qError } = await supabase
      .from("questions")
      .insert(questionRows)
      .select("id, order_index");
    if (qError) throw new Error(qError.message);

    // Link through exam_questions junction table
    if (insertedQs && insertedQs.length > 0) {
      const junctionRows = insertedQs.map((q: { id: string; order_index: number | null }, i: number) => ({
        exam_id: exam.id,
        question_id: q.id,
        order_index: q.order_index ?? i,
        points: 1,
      }));
      const { error: jErr } = await supabase.from("exam_questions").insert(junctionRows);
      if (jErr) throw new Error(jErr.message);
    }

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
      type?: string;
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
      type: examFields.type,
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

      let insertedQuestions:
        | { id: string; order_index: number | null }[]
        | null;
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
      if (
        !insertedQuestions?.length ||
        insertedQuestions.length !== questions.length
      ) {
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

      // Link all inserted questions through exam_questions junction table
      const junctionRows = byOrder.map((row: { id: string; order_index: number | null }, i: number) => ({
        exam_id: exam.id,
        question_id: row.id,
        order_index: row.order_index ?? i,
        points: 1,
      }));
      const { error: jErr } = await supabase.from("exam_questions").insert(junctionRows);
      if (jErr) throw new Error(jErr.message);

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
      type?: string;
    },
  ) => {
    const payload = pickDefined({
      course_id: args.course_id,
      title: args.title,
      description: args.description,
      start_time: args.start_time,
      end_time: args.end_time,
      duration: args.duration,
      type: args.type,
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
  deleteExam: async (_: unknown, args: { id: string }) => {
    try {
      await rollbackExamInsert(args.id);
      return true;
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Failed to delete exam");
    }
  },

  addManualQuestionToExam: async (
    _: unknown,
    args: {
      exam_id: string;
      content: string;
      difficulty: "easy" | "medium" | "hard";
      options: string[];
      correctOptionIndex: number;
    },
  ) => {
    const OPTION_COUNT = 5;
    // 1. Insert question row
    const { data: question, error: qErr } = await supabase
      .from("questions")
      .insert([{
        text: args.content.trim(),
        type: "multiple_choice",
        difficulty: args.difficulty,
      }])
      .select()
      .single();
    if (qErr) throw new Error(qErr.message);

    // 2. Get current max order_index in exam_questions for this exam
    const { data: existing } = await supabase
      .from("exam_questions")
      .select("order_index")
      .eq("exam_id", args.exam_id)
      .order("order_index", { ascending: false })
      .limit(1);
    const nextOrder = existing && existing.length > 0
      ? ((existing[0].order_index ?? 0) + 1)
      : 0;

    // 3. Link to exam via junction table
    const { error: eqErr } = await supabase
      .from("exam_questions")
      .insert([{ exam_id: args.exam_id, question_id: question.id, order_index: nextOrder, points: 1 }]);
    if (eqErr) {
      // rollback question
      await supabase.from("questions").delete().eq("id", question.id);
      throw new Error(eqErr.message);
    }

    // 4. Insert answer options
    const opts = [...args.options];
    while (opts.length < OPTION_COUNT) opts.push("-");
    const answerRows = opts.slice(0, OPTION_COUNT).map((text, i) => ({
      question_id: question.id,
      text: text.trim() || "-",
      is_correct: i === args.correctOptionIndex,
    }));
    const { error: aErr } = await supabase.from("answers").insert(answerRows);
    if (aErr) throw new Error(aErr.message);

    return { ...question, order_index: nextOrder };
  },

  updateManualQuestion: async (
    _: unknown,
    args: {
      id: string;
      content: string;
      difficulty: "easy" | "medium" | "hard";
      options: string[];
      correctOptionIndex: number;
    },
  ) => {
    const OPTION_COUNT = 5;
    // 1. Update question text + difficulty
    const { data: question, error: qErr } = await supabase
      .from("questions")
      .update({ text: args.content.trim(), difficulty: args.difficulty })
      .eq("id", args.id)
      .select()
      .single();
    if (qErr) throw new Error(qErr.message);

    // 2. Delete existing answers and re-insert
    const { error: delErr } = await supabase
      .from("answers")
      .delete()
      .eq("question_id", args.id);
    if (delErr) throw new Error(delErr.message);

    const opts = [...args.options];
    while (opts.length < OPTION_COUNT) opts.push("-");
    const answerRows = opts.slice(0, OPTION_COUNT).map((text, i) => ({
      question_id: args.id,
      text: text.trim() || "-",
      is_correct: i === args.correctOptionIndex,
    }));
    const { error: aErr } = await supabase.from("answers").insert(answerRows);
    if (aErr) throw new Error(aErr.message);

    return question;
  },
};
