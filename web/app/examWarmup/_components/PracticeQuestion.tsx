"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { PracticeQuestion, PracticeSession } from "./practiceTypes";

type PracticeQuestionProps = {
  session: PracticeSession;
  currentQuestion: PracticeQuestion;
  selectedAnswer: string | null;
  setSelectedAnswer: (value: string) => void;
  showExplanation: boolean;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  totalQuestions: number;
};

export default function PracticeQuestion({
  session,
  currentQuestion,
  selectedAnswer,
  setSelectedAnswer,
  showExplanation,
  onSubmitAnswer,
  onNextQuestion,
  totalQuestions,
}: PracticeQuestionProps) {
  const [warningCount, setWarningCount] = useState<number>(0);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLastQuestion = session.currentQuestion >= totalQuestions - 1;

  useEffect(() => {
    const handleWindowLeave = () => {
      if (document.hidden) return;
      setWarningCount((prev) => prev + 1);
      toast.warning(`Анхааруулга ${warningCount + 1}: Цонхноос гарлаа!`, {
        className: "bg-red-600 text-white font-bold border border-red-800",
      });
    };

    document.addEventListener("mouseleave", handleWindowLeave);

    return () => document.removeEventListener("mouseleave", handleWindowLeave);
  }, [warningCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => prev + 1);
        toast.warning(`Анхааруулга ${warningCount + 1}: Tab сольж болохгүй!`, {
          className: "bg-red-600 text-white font-bold border border-red-800",
        });
      }
    };

    const handleWindowBlur = () => {
      if (document.hidden) return;
      setWarningCount((prev) => prev + 1);
      toast.warning(`Анхааруулга ${warningCount + 1}: Цонхноос гарлаа!`, {
        className: "bg-red-600 text-white font-bold border border-red-800",
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [warningCount]);

  const handlePracticeLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      toast.error("Шалгалтын хэсгээс гарах оролдлого илэрлээ");
    }, 100);
  };

  const handlePracticeEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
  };

  return (
    <div
      className="mx-auto max-w-3xl space-y-6"
      id="exam-warmup-area"
      onMouseEnter={handlePracticeEnter}
      onMouseLeave={handlePracticeLeave}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Асуулт {session.currentQuestion + 1} / {totalQuestions}
          </span>
          <Badge className="bg-[#e6f4f1] text-[#006d77]">
            {currentQuestion.difficulty === "easy"
              ? "Хялбар"
              : currentQuestion.difficulty === "medium"
                ? "Дунд"
                : currentQuestion.difficulty === "hard"
                  ? "Хүнд"
                  : ""}
          </Badge>
        </div>
        <Progress
          value={((session.currentQuestion + 1) / totalQuestions) * 100}
          className="h-2 "
        />
      </div>

      <Card>
        <CardHeader>
          <Badge
            variant="secondary"
            className="w-fit bg-[#e6f4f1] text-[#006d77]"
          >
            {currentQuestion.topic}
          </Badge>
          <CardTitle className="mt-4 text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={setSelectedAnswer}
            disabled={showExplanation}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctAnswer;
              const isSelected = selectedAnswer === index.toString();
              let optionClass = "border-border";

              if (!showExplanation && isSelected) {
                optionClass = "border-primary bg-primary/5 ring-1 ring-primary";
              }

              if (showExplanation) {
                if (isCorrect) {
                  optionClass = "border-green-500 bg-green-500/10";
                } else if (isSelected && !isCorrect) {
                  optionClass = "border-red-500 bg-red-500/10";
                }
              }

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                    showExplanation ? "cursor-default" : "cursor-pointer"
                  } ${optionClass}`}
                  onClick={() => {
                    if (showExplanation) return;
                    setSelectedAnswer(index.toString());
                  }}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className={`flex-1 ${showExplanation ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {option}
                  </Label>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              );
            })}
          </RadioGroup>

          {showExplanation && (
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                {/* <BrainCircuit className="h-4 w-4 text-primary" /> */}
                Тайлбар
              </h4>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {!showExplanation ? (
              <Button
                className="flex-1 bg-[#006d77]"
                onClick={onSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Хариултаа илгээх
              </Button>
            ) : (
              <Button className="flex-1" onClick={onNextQuestion}>
                {!isLastQuestion ? (
                  <>
                    Дараагийн асуулт
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Дүнг харах"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
