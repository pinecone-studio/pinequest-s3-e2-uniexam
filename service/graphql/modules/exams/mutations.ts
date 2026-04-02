import { pickDefined } from "@/graphql/shared";
import { normalizeAppDateTimeInput } from "@/lib/date-time";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";

const OPTION_COUNT = 5;

type ManualQuestionArgs = {
  content: string;
  image_url?: string | null;
  difficulty: "easy" | "medium" | "hard";
  options: string[];
  correctOptionIndex: number;
};

const isMissingImageUrlColumnError = (error: { message?: string } | null) => {
  const msg = error?.message?.toLowerCase() ?? "";
  if (error) {
    console.log("Checking for missing image_url column error:", { msg, error });
  }
  return (
    msg.includes("could not find the 'image_url' column") &&
    msg.includes("questions")
  );
};

const hasImageUrlPayload = (value: string | null | undefined) =>
  typeof value === "string" && value.trim().length > 0;

const COURSE_EXAMS_CACHE_KEY = (courseId: string) =>
  `rel:course:${courseId}:exams`;
const EXAM_COURSE_CACHE_KEY = (examId: string) => `rel:exam:${examId}:course`;
const EXAM_QUESTIONS_CACHE_KEY = (examId: string) =>
  `rel:exam:${examId}:questions`;

const invalidateExamCache = async (
  examId?: string,
  courseIds: Array<string | null | undefined> = [],
) => {
  await redis.del("exams");
  await redis.del("courses");

  if (examId) {
    await redis.del(`exam:${examId}`);
    await redis.del(EXAM_COURSE_CACHE_KEY(examId));
    await redis.del(EXAM_QUESTIONS_CACHE_KEY(examId));
  }

  const uniqueCourseIds = [...new Set(courseIds.filter(Boolean) as string[])];
  for (const courseId of uniqueCourseIds) {
    await redis.del(`course:${courseId}`);
    await redis.del(COURSE_EXAMS_CACHE_KEY(courseId));
  }
};

async function rollbackExamInsert(examId: string) {
  const { data: eqRows } = await supabase
    .from("exam_questions")
    .select("question_id")
    .eq("exam_id", examId);
  const qIds = (eqRows ?? []).map(
    (r: { question_id: string }) => r.question_id,
  );

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
  image_url?: string;
};

export const examMutations = {
  createExam: async (_: unknown, args: CreateExamArgs) => {
    const payload = {
      ...args,
      start_time: normalizeAppDateTimeInput(args.start_time),
      end_time: normalizeAppDateTimeInput(args.end_time),
    };

    const { data, error } = await supabase
      .from("exams")
      .insert([payload])
      .select()
      .single();
    if (error) throw new Error(error.message);
    await invalidateExamCache(data?.id, [data?.course_id]);

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
      image_url?: string;
      questions: Array<{ text: string; type: string; order_index: number }>;
    },
  ) => {
    const { questions, ...examPayload } = args;
    const normalizedExamPayload = {
      ...examPayload,
      start_time: normalizeAppDateTimeInput(examPayload.start_time),
      end_time: normalizeAppDateTimeInput(examPayload.end_time),
    };

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert([normalizedExamPayload])
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

    if (insertedQs && insertedQs.length > 0) {
      const junctionRows = insertedQs.map(
        (q: { id: string; order_index: number | null }, i: number) => ({
          exam_id: exam.id,
          question_id: q.id,
          order_index: q.order_index ?? i,
          points: 1,
        }),
      );
      const { error: jErr } = await supabase
        .from("exam_questions")
        .insert(junctionRows);
      if (jErr) throw new Error(jErr.message);
    }

    await invalidateExamCache(exam?.id, [exam?.course_id]);

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
      image_url?: string;
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
      start_time: normalizeAppDateTimeInput(examFields.start_time),
      end_time: normalizeAppDateTimeInput(examFields.end_time),
      duration: examFields.duration,
      type: examFields.type,
      image_url: examFields.image_url,
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
        image_url: q.image_url ?? null,
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
          const missingImageUrl = isMissingImageUrlColumnError(first.error);
          const includesImage = questionRows.some((row) =>
            hasImageUrlPayload(row.image_url),
          );
          console.log("Supabase insertion error detail:", {
            error: first.error,
            includesImage,
            missingImageUrl,
          });
          if (missingImageUrl && includesImage) {
            throw new Error(
              "questions.image_url column is missing. Please run the latest migration to store question images.",
            );
          }
          if (missingDifficulty || missingImageUrl) {
            const normalizedRows = questionRows.map((row) => {
              const noDifficulty = missingDifficulty
                ? (({ difficulty: _d, ...rest }) => rest)(row)
                : row;
              if (missingImageUrl) {
                const { image_url: _img, ...rest } = noDifficulty;
                return rest;
              }
              return noDifficulty;
            });
            const second = await supabase
              .from("questions")
              .insert(normalizedRows)
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

      const junctionRows = byOrder.map(
        (row: { id: string; order_index: number | null }, i: number) => ({
          exam_id: exam.id,
          question_id: row.id,
          order_index: row.order_index ?? i,
          points: 1,
        }),
      );
      const { error: jErr } = await supabase
        .from("exam_questions")
        .insert(junctionRows);
      if (jErr) throw new Error(jErr.message);

      await invalidateExamCache(exam?.id, [exam?.course_id]);

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
      image_url?: string;
    },
  ) => {
    const { data: before, error: beforeErr } = await supabase
      .from("exams")
      .select("id, course_id")
      .eq("id", args.id)
      .maybeSingle();
    if (beforeErr) throw new Error(beforeErr.message);

    const payload = pickDefined({
      course_id: args.course_id,
      title: args.title,
      description: args.description,
      start_time: args.start_time
        ? normalizeAppDateTimeInput(args.start_time)
        : undefined,
      end_time: args.end_time
        ? normalizeAppDateTimeInput(args.end_time)
        : undefined,
      duration: args.duration,
      type: args.type,
      image_url: args.image_url,
    });

    const { data, error } = await supabase
      .from("exams")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await invalidateExamCache(args.id, [before?.course_id, data?.course_id]);
    return data;
  },

  deleteExam: async (_: unknown, args: { id: string }) => {
    try {
      const { data: before, error: beforeErr } = await supabase
        .from("exams")
        .select("id, course_id")
        .eq("id", args.id)
        .maybeSingle();
      if (beforeErr) throw new Error(beforeErr.message);

      await rollbackExamInsert(args.id);
      await invalidateExamCache(args.id, [before?.course_id]);
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
      image_url?: string | null;
      difficulty: "easy" | "medium" | "hard";
      options: string[];
      correctOptionIndex: number;
    },
  ) => {
    const OPTION_COUNT = 5;
    const firstInsert = await supabase
      .from("questions")
      .insert([
        {
          text: args.content.trim(),
          image_url: args.image_url ?? null,
          type: "multiple_choice",
          difficulty: args.difficulty,
        },
      ])
      .select()
      .single();
    let question = firstInsert.data;
    let qErr = firstInsert.error;

    if (qErr) {
      console.log("addManualQuestionToExam insertion error:", qErr);
    }

    if (qErr && isMissingImageUrlColumnError(qErr)) {
      if (hasImageUrlPayload(args.image_url)) {
        throw new Error(
          "questions.image_url column is missing. Please run the latest migration to store question images.",
        );
      }
      const secondInsert = await supabase
        .from("questions")
        .insert([
          {
            text: args.content.trim(),
            type: "multiple_choice",
            difficulty: args.difficulty,
          },
        ])
        .select()
        .single();
      question = secondInsert.data;
      qErr = secondInsert.error;
    }
    if (qErr) throw new Error(qErr.message);

    const { data: existing } = await supabase
      .from("exam_questions")
      .select("order_index")
      .eq("exam_id", args.exam_id)
      .order("order_index", { ascending: false })
      .limit(1);
    const nextOrder =
      existing && existing.length > 0 ? (existing[0].order_index ?? 0) + 1 : 0;

    const { error: eqErr } = await supabase.from("exam_questions").insert([
      {
        exam_id: args.exam_id,
        question_id: question.id,
        order_index: nextOrder,
        points: 1,
      },
    ]);
    if (eqErr) {
      await supabase.from("questions").delete().eq("id", question.id);
      throw new Error(eqErr.message);
    }

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
      image_url?: string | null;
      difficulty: "easy" | "medium" | "hard";
      options: string[];
      correctOptionIndex: number;
    },
  ) => {
    const OPTION_COUNT = 5;
    const firstUpdate = await supabase
      .from("questions")
      .update({
        text: args.content.trim(),
        image_url: args.image_url ?? null,
        difficulty: args.difficulty,
      })
      .eq("id", args.id)
      .select()
      .single();
    let question = firstUpdate.data;
    let qErr = firstUpdate.error;

    if (qErr) {
      console.log("updateManualQuestion update error:", qErr);
    }

    if (qErr && isMissingImageUrlColumnError(qErr)) {
      if (hasImageUrlPayload(args.image_url)) {
        throw new Error(
          "questions.image_url column is missing. Please run the latest migration to store question images.",
        );
      }
      const secondUpdate = await supabase
        .from("questions")
        .update({
          text: args.content.trim(),
          difficulty: args.difficulty,
        })
        .eq("id", args.id)
        .select()
        .single();
      question = secondUpdate.data;
      qErr = secondUpdate.error;
    }
    if (qErr) throw new Error(qErr.message);

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

  addOpenEndedQuestion: async (
    _: unknown,
    args: {
      exam_id: string;
      content: string;
      image_url?: string | null;
      difficulty: "easy" | "medium" | "hard";
      max_points?: number;
    },
  ) => {
    const { data: question, error: qErr } = await supabase
      .from("questions")
      .insert([
        {
          text: args.content.trim(),
          image_url: args.image_url ?? null,
          type: "open_ended",
          question_type: "open_ended",
          difficulty: args.difficulty,
          max_points: args.max_points ?? 1,
        },
      ])
      .select()
      .single();
    if (qErr) throw new Error(qErr.message);

    const { data: existing } = await supabase
      .from("exam_questions")
      .select("order_index")
      .eq("exam_id", args.exam_id)
      .order("order_index", { ascending: false })
      .limit(1);
    const nextOrder =
      existing && existing.length > 0 ? (existing[0].order_index ?? 0) + 1 : 0;

    const { error: eqErr } = await supabase.from("exam_questions").insert([
      {
        exam_id: args.exam_id,
        question_id: question.id,
        order_index: nextOrder,
        points: args.max_points ?? 1,
      },
    ]);
    if (eqErr) {
      await supabase.from("questions").delete().eq("id", question.id);
      throw new Error(eqErr.message);
    }

    return { ...question, order_index: nextOrder };
  },

  updateOpenEndedQuestion: async (
    _: unknown,
    args: {
      id: string;
      content: string;
      image_url?: string | null;
      difficulty: "easy" | "medium" | "hard";
      max_points?: number;
    },
  ) => {
    const { data: question, error: qErr } = await supabase
      .from("questions")
      .update({
        text: args.content.trim(),
        image_url: args.image_url ?? null,
        difficulty: args.difficulty,
        max_points: args.max_points ?? 1,
      })
      .eq("id", args.id)
      .select()
      .single();
    if (qErr) throw new Error(qErr.message);

    await supabase
      .from("exam_questions")
      .update({ points: args.max_points ?? 1 })
      .eq("question_id", args.id);

    return question;
  },

  deleteQuestion: async (_: unknown, args: { id: string }) => {
    await supabase.from("exam_questions").delete().eq("question_id", args.id);
    await supabase.from("answers").delete().eq("question_id", args.id);
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", args.id);
    if (error) throw new Error(error.message);
    return true;
  },
};
