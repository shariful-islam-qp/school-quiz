"use client";

import { useState } from "react";
import { SettingsForm } from "@/components/SettingsForm";
import { QuizPlayer } from "@/components/QuizPlayer";
import { ScoreScreen } from "@/components/ScoreScreen";
import type {
  AnswerSubmission,
  PublicQuestion,
  QuestionResult,
  QuizSettings,
  ScoreResult,
} from "@/lib/types";

type Phase = "settings" | "playing" | "score";

type ActiveQuiz = {
  quizId: string;
  questions: PublicQuestion[];
  timeLimitSeconds: number;
};

export function QuizApp() {
  const [phase, setPhase] = useState<Phase>("settings");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);

  async function startQuiz(settings: QuizSettings) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not start quiz.");
      }

      setActiveQuiz({
        quizId: data.quizId,
        questions: data.questions,
        timeLimitSeconds: data.timeLimitSeconds,
      });
      setScore(null);
      setPhase("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start quiz.");
    } finally {
      setIsLoading(false);
    }
  }

  async function finishQuiz(
    answers: AnswerSubmission[],
    results: QuestionResult[],
  ) {
    if (!activeQuiz) {
      return;
    }

    const localScore: ScoreResult = {
      score: results.filter((item) => item.isCorrect).length,
      total: results.length,
      results,
    };

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuiz.quizId,
          answers,
        }),
      });
      const data = await response.json();
      setScore(response.ok ? data : localScore);
    } catch {
      setScore(localScore);
    }

    setPhase("score");
  }

  function playAgain() {
    setActiveQuiz(null);
    setScore(null);
    setError(null);
    setPhase("settings");
  }

  return (
    <main className="app-shell">
      {phase === "settings" ? (
        <SettingsForm
          onStart={startQuiz}
          isLoading={isLoading}
          error={error}
        />
      ) : null}

      {phase === "playing" && activeQuiz ? (
        <QuizPlayer
          key={activeQuiz.quizId}
          quizId={activeQuiz.quizId}
          questions={activeQuiz.questions}
          timeLimitSeconds={activeQuiz.timeLimitSeconds}
          onComplete={finishQuiz}
        />
      ) : null}

      {phase === "score" && score ? (
        <ScoreScreen result={score} onPlayAgain={playAgain} />
      ) : null}
    </main>
  );
}
