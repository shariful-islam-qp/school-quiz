"use client";

import { useEffect, useState } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { QuizPlayer } from "@/components/QuizPlayer";
import { ScoreScreen } from "@/components/ScoreScreen";
import {
  loadPreferences,
  preferencesToSettings,
  savePreferences,
  type QuizPreferences,
} from "@/lib/preferences";
import type {
  AnswerSubmission,
  PublicQuestion,
  QuestionResult,
  QuizSubject,
  ScoreResult,
} from "@/lib/types";

type Phase = "home" | "settings" | "playing" | "score";

type ActiveQuiz = {
  quizId: string;
  questions: PublicQuestion[];
  timeLimitSeconds: number;
};

export function QuizApp() {
  const [phase, setPhase] = useState<Phase>("home");
  const [subject, setSubject] = useState<QuizSubject>("math");
  const [preferences, setPreferences] = useState<QuizPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  async function startQuiz() {
    if (!preferences) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferencesToSettings(subject, preferences)),
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
    setPhase("home");
  }

  function handleSavePreferences(next: QuizPreferences) {
    savePreferences(next);
    setPreferences(next);
    setPhase("home");
  }

  if (!preferences) {
    return (
      <main className="app-shell">
        <div className="panel loading-panel">Loading…</div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="playfield" aria-hidden>
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>

      {phase === "home" ? (
        <HomeScreen
          subject={subject}
          preferences={preferences}
          isLoading={isLoading}
          error={error}
          onSubjectChange={setSubject}
          onOpenSettings={() => setPhase("settings")}
          onStart={() => void startQuiz()}
        />
      ) : null}

      {phase === "settings" ? (
        <SettingsScreen
          initialPreferences={preferences}
          onSave={handleSavePreferences}
          onBack={() => setPhase("home")}
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
