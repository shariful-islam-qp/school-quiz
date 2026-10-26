"use client";

import { useEffect, useState } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { QuizPlayer } from "@/components/QuizPlayer";
import { ScoreScreen } from "@/components/ScoreScreen";
import {
  DEFAULT_PREFERENCES,
  preferencesToSettings,
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
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Could not load settings.");
        }
        if (!cancelled) {
          setPreferences(data as QuizPreferences);
        }
      } catch {
        if (!cancelled) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            operations: [...DEFAULT_PREFERENCES.operations],
          });
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
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

  function endQuiz() {
    setActiveQuiz(null);
    setScore(null);
    setError(null);
    setPhase("home");
  }

  async function restartQuiz() {
    if (!preferences) {
      return;
    }

    setScore(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferencesToSettings(subject, preferences)),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not restart quiz.");
      }

      setActiveQuiz({
        quizId: data.quizId,
        questions: data.questions,
        timeLimitSeconds: data.timeLimitSeconds,
      });
      setPhase("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restart quiz.");
      setActiveQuiz(null);
      setPhase("home");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSavePreferences(next: QuizPreferences) {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Could not save settings.");
    }

    setPreferences(data as QuizPreferences);
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
          onEnd={endQuiz}
          onRestart={() => void restartQuiz()}
        />
      ) : null}

      {phase === "score" && score ? (
        <ScoreScreen result={score} onPlayAgain={playAgain} />
      ) : null}
    </main>
  );
}
