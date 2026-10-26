"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AnswerSubmission,
  PublicQuestion,
  QuestionResult,
} from "@/lib/types";

type ConfirmAction = "end" | "restart" | null;

type QuizPlayerProps = {
  quizId: string;
  questions: PublicQuestion[];
  timeLimitSeconds: number;
  onComplete: (
    answers: AnswerSubmission[],
    results: QuestionResult[],
  ) => Promise<void>;
  onEnd: () => void;
  onRestart: () => void;
};

export function QuizPlayer({
  quizId,
  questions,
  timeLimitSeconds,
  onComplete,
  onEnd,
  onRestart,
}: QuizPlayerProps) {
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);
  const [feedback, setFeedback] = useState<QuestionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [error, setError] = useState<string | null>(null);

  const answersRef = useRef<AnswerSubmission[]>([]);
  const resultsRef = useRef<QuestionResult[]>([]);
  const lockedRef = useRef(false);
  const indexRef = useRef(index);
  const feedbackRef = useRef(feedback);

  indexRef.current = index;
  feedbackRef.current = feedback;

  const question = questions[index];
  const timerPaused =
    Boolean(feedback) || isChecking || isFinishing || Boolean(confirmAction);

  useEffect(() => {
    lockedRef.current = false;
    setFeedback(null);
    setError(null);
    setSecondsLeft(timeLimitSeconds);
  }, [index, timeLimitSeconds]);

  useEffect(() => {
    if (timerPaused || secondsLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft, timerPaused, index]);

  useEffect(() => {
    if (secondsLeft === 0 && !feedbackRef.current && !lockedRef.current) {
      void submitAnswer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only fire on timeout
  }, [secondsLeft]);

  async function submitAnswer(selectedIndex: number | null) {
    if (
      lockedRef.current ||
      feedback ||
      isChecking ||
      isFinishing ||
      confirmAction
    ) {
      return;
    }

    lockedRef.current = true;
    setIsChecking(true);
    setError(null);

    const currentIndex = indexRef.current;
    const currentQuestion = questions[currentIndex];

    try {
      const response = await fetch("/api/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          questionId: currentQuestion.id,
          selectedIndex,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not check answer.");
      }

      const result = data as QuestionResult;
      answersRef.current = [
        ...answersRef.current,
        { questionId: currentQuestion.id, selectedIndex },
      ];
      resultsRef.current = [...resultsRef.current, result];
      setFeedback(result);
    } catch (err) {
      lockedRef.current = false;
      setError(err instanceof Error ? err.message : "Could not check answer.");
    } finally {
      setIsChecking(false);
    }
  }

  async function goNext() {
    if (!feedback || isFinishing) {
      return;
    }

    if (index >= questions.length - 1) {
      setIsFinishing(true);
      await onComplete(answersRef.current, resultsRef.current);
      return;
    }

    setFeedback(null);
    setError(null);
    setIndex((current) => current + 1);
  }

  const timerPausedVisual = Boolean(feedback) || Boolean(confirmAction);
  const timeRatio = Math.max(0, Math.min(1, secondsLeft / timeLimitSeconds));
  const timerTone = timerPausedVisual
    ? "paused"
    : timeRatio > 0.5
      ? "ok"
      : timeRatio > 0.25
        ? "warn"
        : "danger";
  const banglaText = /[\u0980-\u09FF]/.test(question.prompt);

  function optionClass(optionIndex: number): string {
    if (!feedback) {
      return "option-btn";
    }

    if (optionIndex === feedback.correctIndex) {
      return "option-btn is-correct";
    }

    if (
      feedback.selectedIndex === optionIndex &&
      optionIndex !== feedback.correctIndex
    ) {
      return "option-btn is-wrong";
    }

    return "option-btn is-dimmed";
  }

  function confirmTitle(): string {
    return confirmAction === "restart" ? "Restart quiz?" : "End quiz?";
  }

  function confirmMessage(): string {
    return confirmAction === "restart"
      ? "This quiz will stop and a new one will start."
      : "Your progress will be lost and you will go home.";
  }

  function confirmLabel(): string {
    return confirmAction === "restart" ? "Restart" : "End quiz";
  }

  function handleConfirm() {
    if (confirmAction === "restart") {
      onRestart();
      return;
    }
    if (confirmAction === "end") {
      onEnd();
    }
  }

  return (
    <section className="quiz-player panel pop-in">
      <div className="quiz-toolbar">
        <button
          type="button"
          className="quiz-tool-btn"
          onClick={() => setConfirmAction("end")}
          disabled={isFinishing}
        >
          End
        </button>
        <button
          type="button"
          className="quiz-tool-btn"
          onClick={() => setConfirmAction("restart")}
          disabled={isFinishing}
        >
          Restart
        </button>
      </div>

      <div className="quiz-meta">
        <span>
          Question {index + 1} of {questions.length}
        </span>
      </div>

      <div
        className={`time-progress tone-${timerTone}`}
        role="timer"
        aria-label={
          timerPausedVisual
            ? "Timer paused"
            : `${secondsLeft} seconds remaining out of ${timeLimitSeconds}`
        }
        style={{
          margin: "0 0 1rem",
          padding: "0.75rem 0.9rem",
          borderRadius: 16,
          border: "2px solid",
          borderColor:
            timerTone === "warn"
              ? "#fde68a"
              : timerTone === "danger"
                ? "#fecaca"
                : timerTone === "paused"
                  ? "#e2e8f0"
                  : "#bbf7d0",
          background:
            timerTone === "warn"
              ? "#fffbeb"
              : timerTone === "danger"
                ? "#fef2f2"
                : timerTone === "paused"
                  ? "#f8fafc"
                  : "#ecfdf3",
        }}
      >
        <div
          className="time-progress-top"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.55rem",
            fontWeight: 800,
          }}
        >
          <strong>Time left</strong>
          <span>
            {timerPausedVisual
              ? "Paused"
              : `${secondsLeft}s / ${timeLimitSeconds}s`}
          </span>
        </div>
        <div
          className="time-progress-track"
          style={{
            width: "100%",
            height: 18,
            borderRadius: 999,
            background: "#ffffff",
            border: "1px solid rgba(36, 52, 71, 0.12)",
            overflow: "hidden",
          }}
        >
          <div
            className="time-progress-fill"
            style={{
              width: `${Math.max(timeRatio * 100, timeRatio > 0 ? 2 : 0)}%`,
              height: "100%",
              minHeight: 18,
              borderRadius: 999,
              background:
                timerTone === "warn"
                  ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                  : timerTone === "danger"
                    ? "linear-gradient(90deg, #fb7185, #ef4444)"
                    : timerTone === "paused"
                      ? "#94a3b8"
                      : "linear-gradient(90deg, #4ade80, #16a34a)",
              transition: "width 900ms linear, background 160ms ease",
            }}
          />
        </div>
      </div>

      <h2
        key={question.id}
        lang={banglaText ? "bn" : undefined}
        className={banglaText ? "prompt prompt-compact" : "prompt"}
      >
        {question.prompt}
      </h2>

      <div className="options-grid">
        {question.options.map((option, optionIndex) => (
          <button
            key={`${question.id}-${option}-${optionIndex}`}
            type="button"
            lang={banglaText ? "bn" : undefined}
            className={optionClass(optionIndex)}
            disabled={
              Boolean(feedback) ||
              isChecking ||
              isFinishing ||
              Boolean(confirmAction)
            }
            onClick={() => void submitAnswer(optionIndex)}
          >
            {option}
          </button>
        ))}
      </div>

      {isChecking ? <p className="status">Checking…</p> : null}

      {error ? <p className="error">{error}</p> : null}

      {feedback ? (
        <div
          className={`feedback-banner ${feedback.isCorrect ? "ok" : "bad"}`}
        >
          <p>
            {feedback.isCorrect
              ? "Correct!"
              : feedback.timedOut
                ? `Time’s up. Answer: ${feedback.correctAnswer}`
                : `Wrong. Correct answer: ${feedback.correctAnswer}`}
          </p>
          <button
            type="button"
            className="primary-btn"
            disabled={isFinishing}
            onClick={() => void goNext()}
          >
            {isFinishing
              ? "Finishing…"
              : index >= questions.length - 1
                ? "See final score"
                : "Next question"}
          </button>
        </div>
      ) : null}

      {confirmAction ? (
        <div
          className="exit-modal-backdrop"
          role="presentation"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="exit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="quiz-confirm-title">{confirmTitle()}</h3>
            <p>{confirmMessage()}</p>
            <div className="exit-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setConfirmAction(null)}
              >
                Keep playing
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={handleConfirm}
              >
                {confirmLabel()}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
