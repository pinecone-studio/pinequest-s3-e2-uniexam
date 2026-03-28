"use client";

import { useState } from "react";
import { practiceQuestions } from "@/lib/data";
import PracticeHeader from "./PracticeHeader";
import PracticeQuestion from "./PracticeQuestion";
import PracticeResults from "./PracticeResults";
import PracticeSetup from "./PracticeSetup";
import type { PracticeMode, PracticeSession } from "./practiceTypes";

export default function PracticePage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("exam");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string>("medium");

  const startPractice = async () => {
    if (!selectedExam && !selectedTopic) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSession({
      examId: selectedExam || "",
      currentQuestion: 0,
      answers: new Array(practiceQuestions.length).fill(null),
      showResults: false,
    });
    setIsGenerating(false);
  };

  const handleAnswer = () => {
    if (!session || selectedAnswer === null) return;

    const newAnswers = [...session.answers];
    newAnswers[session.currentQuestion] = parseInt(selectedAnswer, 10);
    setSession({ ...session, answers: newAnswers });
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!session) return;

    if (session.currentQuestion < practiceQuestions.length - 1) {
      setSession({
        ...session,
        currentQuestion: session.currentQuestion + 1,
      });
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setSession({ ...session, showResults: true });
    }
  };

  const resetPractice = () => {
    setSession(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSelectedExam(null);
    setSelectedTopic(null);
  };

  const retryPractice = () => {
    if (!session) return;
    setSession({
      ...session,
      currentQuestion: 0,
      answers: new Array(practiceQuestions.length).fill(null),
      showResults: false,
    });
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const currentQuestion = session
    ? practiceQuestions[session.currentQuestion]
    : null;
  const correctAnswers = session
    ? session.answers.filter(
        (answer, index) => answer === practiceQuestions[index].correctAnswer,
      ).length
    : 0;

  return (
    <div className="space-y-6 ">
      <PracticeHeader />

      {!session ? (
        <PracticeSetup
          practiceMode={practiceMode}
          setPracticeMode={setPracticeMode}
          selectedExam={selectedExam}
          setSelectedExam={setSelectedExam}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isGenerating={isGenerating}
          onStartPractice={startPractice}
        />
      ) : !session.showResults ? (
        currentQuestion && (
          <PracticeQuestion
            session={session}
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            showExplanation={showExplanation}
            onSubmitAnswer={handleAnswer}
            onNextQuestion={nextQuestion}
            totalQuestions={practiceQuestions.length}
          />
        )
      ) : (
        <PracticeResults
          correctAnswers={correctAnswers}
          totalQuestions={practiceQuestions.length}
          onReset={resetPractice}
          onRetry={retryPractice}
        />
      )}
    </div>
  );
}
