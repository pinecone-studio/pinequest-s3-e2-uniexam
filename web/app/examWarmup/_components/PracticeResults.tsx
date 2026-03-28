"use client";

import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PracticeResultsProps = {
  correctAnswers: number;
  totalQuestions: number;
  onReset: () => void;
  onRetry: () => void;
};

export default function PracticeResults({
  correctAnswers,
  totalQuestions,
  onReset,
  onRetry,
}: PracticeResultsProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Давтлага дууслаа!</CardTitle>
          <CardDescription>{"Таны гүйцэтгэл"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-secondary"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(correctAnswers / totalQuestions) * 440} 440`}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-3xl font-bold">
                  {Math.round((correctAnswers / totalQuestions) * 100)}%
                </div>
                {/* <div className="text-sm text-muted-foreground">
                  Зөв хувь
                </div> */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-green-500/10 p-4">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-500">
                  {correctAnswers}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Зөв</p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-4">
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-500">
                  {totalQuestions - correctAnswers}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Буруу</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Шинээр эхлэх
            </Button>
            <Button className="flex-1" onClick={onRetry}>
              Дахин давтах
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
