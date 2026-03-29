import { pickDefined } from "@/graphql/shared";
import { supabase } from "@/lib/supabase";

const OPTION_COUNT = 5;

type Difficulty = "easy" | "medium" | "hard";

function validateManualOptions(
  options: string[],
  correctOptionIndex: number,
  label: string,
) {
  if (!options || options.length !== OPTION_COUNT) {
    throw new Error(`${label}: exactly ${OPTION_COUNT} options are required.`);
  }
  for (let j = 0; j < OPTION_COUNT; j++) {
    if (!options[j]?.trim()) {
      throw new Error(`${label}: option ${j + 1} cannot be empty.`);
    }
  }
  if (
    correctOptionIndex < 0 ||
    correctOptionIndex >= OPTION_COUNT ||
    !Number.isInteger(correctOptionIndex)
  ) {
    throw new Error(
      `${label}: correctOptionIndex must be an integer from 0 to ${OPTION_COUNT - 1}.`,
    );
  }
}

async function insertQuestionRow(row: {
  exam_id: string;
  text: string;
  type: string;
  order_index: number;
  difficulty: Difficulty;
}) {
  const attempt = await supabase
    .from("questions")
    .insert([row])
    .select()
    .single();

  if (attempt.error) {
    const msg = attempt.error.message?.toLowerCase() ?? "";
    if (msg.includes("difficulty")) {
      const { difficulty: _d, ...rest } = row;
      const second = await supabase
        .from("questions")
        .insert([rest])
        .select()
        .single();
      if (second.error) throw new Error(second.error.message);
      return second.data;
    }
    throw new Error(attempt.error.message);
  }
  return attempt.data;
}

async function insertAnswersForQuestion(
  questionId: string,
  options: string[],
  correctOptionIndex: number,
) {
  const answerRows = options.map((text, j) => ({
    question_id: questionId,
    text: text.trim(),
    is_correct: j === correctOptionIndex,
  }));
  const { error } = await supabase.from("answers").insert(answerRows);
  if (error) throw new Error(error.message);
}

type CreateQuestionArgs = {
  exam_id: string;
  text: string;
  type: string;
  order_index: number;
};

export const questionMutations = {
  createQuestion: async (_: unknown, args: CreateQuestionArgs) => {
    const { data, error } = await supabase
      .from("questions")
      .insert([args])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  updateQuestion: async (
    _: unknown,
    args: {
      id: string;
      exam_id?: string;
      text?: string;
      type?: string;
      order_index?: number;
      difficulty?: string;
    },
  ) => {
    const payload = pickDefined({
      exam_id: args.exam_id,
      text: args.text,
      type: args.type,
      order_index: args.order_index,
      difficulty: args.difficulty,
    });

    const { data, error } = await supabase
      .from("questions")
      .update(payload)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  addManualQuestionToExam: async (
    _: unknown,
    args: {
      exam_id: string;
      content: string;
      difficulty: Difficulty;
      options: string[];
      correctOptionIndex: number;
    },
  ) => {
    if (!args.content?.trim()) {
      throw new Error("Question content is required.");
    }
    validateManualOptions(
      args.options,
      args.correctOptionIndex,
      "New question",
    );

    const { data: maxRows, error: maxErr } = await supabase
      .from("questions")
      .select("order_index")
      .eq("exam_id", args.exam_id)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxErr) throw new Error(maxErr.message);

    const nextIndex = (maxRows?.[0]?.order_index ?? -1) + 1;

    const questionRow = {
      exam_id: args.exam_id,
      text: args.content.trim(),
      type: "multiple_choice",
      order_index: nextIndex,
      difficulty: args.difficulty,
    };

    const inserted = await insertQuestionRow(questionRow);
    if (!inserted?.id) throw new Error("Failed to create question.");

    await insertAnswersForQuestion(
      inserted.id,
      args.options,
      args.correctOptionIndex,
    );

    return inserted;
  },
  updateManualQuestion: async (
    _: unknown,
    args: {
      id: string;
      content: string;
      difficulty: Difficulty;
      options: string[];
      correctOptionIndex: number;
    },
  ) => {
    if (!args.content?.trim()) {
      throw new Error("Question content is required.");
    }
    validateManualOptions(
      args.options,
      args.correctOptionIndex,
      "Question",
    );

    let updated: {
      id: string;
      exam_id: string;
      text: string;
      type: string;
      order_index: number;
      difficulty?: string | null;
    } | null = null;

    const withDifficulty = await supabase
      .from("questions")
      .update({
        text: args.content.trim(),
        difficulty: args.difficulty,
        type: "multiple_choice",
      })
      .eq("id", args.id)
      .select()
      .single();

    if (withDifficulty.error) {
      const msg = withDifficulty.error.message?.toLowerCase() ?? "";
      if (msg.includes("difficulty")) {
        const noDiff = await supabase
          .from("questions")
          .update({
            text: args.content.trim(),
            type: "multiple_choice",
          })
          .eq("id", args.id)
          .select()
          .single();
        if (noDiff.error) throw new Error(noDiff.error.message);
        updated = noDiff.data;
      } else {
        throw new Error(withDifficulty.error.message);
      }
    } else {
      updated = withDifficulty.data;
    }

    const { error: delErr } = await supabase
      .from("answers")
      .delete()
      .eq("question_id", args.id);
    if (delErr) throw new Error(delErr.message);

    await insertAnswersForQuestion(
      args.id,
      args.options,
      args.correctOptionIndex,
    );

    return updated;
  },
  deleteQuestion: async (_: unknown, args: { id: string }) => {
    const { error: aErr } = await supabase
      .from("answers")
      .delete()
      .eq("question_id", args.id);
    if (aErr) throw new Error(aErr.message);

    const { error: qErr } = await supabase
      .from("questions")
      .delete()
      .eq("id", args.id);
    if (qErr) throw new Error(qErr.message);

    return true;
  },
};
