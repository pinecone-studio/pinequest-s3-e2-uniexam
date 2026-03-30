"use client";

import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphql";
import { ExamMeta, ExamQuestion } from "../exam-types";

type ExamQueryResponse = {
  exam: {
    id: string;
    title: string;
    duration: number;
    course: {
      name: string;
      code: string;
    } | null;
  } | null;
  examQuestions: {
    id: string;
    question_id: string;
    order_index: number;
    points: number;
  }[];
  questions: {
    id: string;
    text: string;
    type: string;
    difficulty: string | null;
  }[];
  answers: {
    id: string;
    question_id: string;
    text: string;
    is_correct: boolean;
    order_index: number;
  }[];
};

type LoadedExamData = {
  exam: ExamMeta;
  questions: ExamQuestion[];
};

type ExamQueryQuestion = ExamQueryResponse["questions"][number];
type ExamQueryAnswer = ExamQueryResponse["answers"][number];

const EXAM_PAGE_QUERY = `
  query ExamPageData($examId: String!) {
    exam(id: $examId) {
      id
      title
      duration
      course {
        name
        code
      }
    }
    examQuestions(exam_id: $examId) {
      id
      question_id
      order_index
      points
    }
    questions {
      id
      text
      type
      difficulty
    }
    answers {
      id
      question_id
      text
      is_correct
      order_index
    }
  }
`;

const getQuestionType = (
  type: string | null | undefined,
  options: { text: string }[],
): ExamQuestion["type"] => {
  const normalized = type?.toLowerCase() ?? "";

  if (normalized.includes("short")) return "Short Answer";
  if (normalized.includes("multiple")) return "Multiple Choice";
  if (normalized.includes("true")) return "True/False";

  if (
    options.length === 2 &&
    options.every((option) =>
      ["true", "false", "үнэн", "худал"].includes(option.text.toLowerCase()),
    )
  ) {
    return "True/False";
  }

  if (options.length > 0) return "Multiple Choice";

  return "Short Answer";
};

const getDifficulty = (
  value: string | null | undefined,
): ExamQuestion["difficulty"] => {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized === "hard") return "Hard";
  if (normalized === "medium") return "Medium";
  return "Easy";
};

const isDefined = <T,>(value: T | null): value is T => value !== null;

const buildExamData = (data: ExamQueryResponse): LoadedExamData | null => {
  if (!data.exam) {
    return null;
  }

  const questionsById = new Map<string, ExamQueryQuestion>(
    data.questions.map((question) => [question.id, question]),
  );
  const answersByQuestionId = new Map<string, ExamQueryAnswer[]>();

  for (const answer of data.answers) {
    const currentAnswers = answersByQuestionId.get(answer.question_id) ?? [];
    currentAnswers.push(answer);
    answersByQuestionId.set(answer.question_id, currentAnswers);
  }

  const examQuestions = [...(data.examQuestions ?? [])]
    .sort((left, right) => left.order_index - right.order_index)
    .map<ExamQuestion | null>((examQuestion, index) => {
      const question = questionsById.get(examQuestion.question_id);

      if (!question) {
        return null;
      }

      const orderedAnswers = [
        ...(answersByQuestionId.get(question.id) ?? []),
      ].sort((left, right) => left.order_index - right.order_index);
      const choiceIds = "abcdefghijklmnopqrstuvwxyz";
      const type = getQuestionType(question.type, orderedAnswers);

      return {
        id: index + 1,
        question: question.text,
        type,
        difficulty: getDifficulty(question.difficulty),
        choices:
          orderedAnswers.length > 0
            ? orderedAnswers.map((answer, answerIndex) => ({
                id: choiceIds[answerIndex] ?? `${answerIndex + 1}`,
                label: answer.text,
              }))
            : undefined,
        correctAnswer:
          orderedAnswers.length > 0
            ? choiceIds[
                orderedAnswers.findIndex((answer) => answer.is_correct)
              ] ?? ""
            : "",
      };
    })
    .filter(isDefined);

  return {
    exam: {
      id: data.exam.id,
      title: data.exam.title,
      subtitle: data.exam.course?.name ?? data.exam.course?.code ?? undefined,
      durationSeconds: (data.exam.duration ?? 0) * 60,
    },
    questions: examQuestions,
  };
};

export const useExamData = (examId: string | null) => {
  const [data, setData] = useState<LoadedExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!examId) {
      setData(null);
      setLoading(false);
      setError("Шалгалтын id олдсонгүй.");
      return;
    }

    const loadExam = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await graphqlRequest<ExamQueryResponse>(
          EXAM_PAGE_QUERY,
          { examId },
        );

        if (cancelled) return;

        const nextData = buildExamData(response);

        if (!nextData) {
          setData(null);
          setError("Шалгалтын мэдээлэл олдсонгүй.");
          return;
        }

        setData(nextData);
      } catch (fetchError) {
        if (cancelled) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Шалгалтын мэдээлэл дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadExam();

    return () => {
      cancelled = true;
    };
  }, [examId]);

  return {
    data,
    loading,
    error,
  };
};
