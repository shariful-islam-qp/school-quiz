"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AnswerSubmission,
  PublicQuestion,
  QuestionResult,
} from "@/lib/types";

type QuizPlayerProps = {
  quizId: string;
  questions: PublicQuestion[];
  timeLimitSeconds: number;
  onComplete: (
    answers: AnswerSubmission[],
    results: QuestionResult[],
  ) => Promise<void>;
};

export function QuizPlayer({
  quizId,
  questions,
  timeLimitSeconds,
  onComplete,
}: QuizPlayerProps) {
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);
  const [feedback, setFeedback] = useState<QuestionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answersRef = useRef<AnswerSubmission[]>([]);
  const resultsRef = useRef<QuestionResult[]>([]);
  const lockedRef = useRef(false);
  const indexRef = useRef(index);
  const feedbackRef = useRef(feedback);

  indexRef.current = index;
  feedbackRef.current = feedback;

  const question = questions[index];
  const progress = ((index + 1) / questions.length) * 100;
  const timerPaused = Boolean(feedback) || isChecking || isFinishing;

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
    if (lockedRef.current || feedback || isChecking || isFinishing) {
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

  const timerUrgent = secondsLeft <= 10 && !feedback;
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

  return (
    <section className="quiz-player panel pop-in">
      <div className="quiz-meta">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span className={`timer ${timerUrgent ? "urgent" : ""}`}>
          {feedback ? "—" : `${secondsLeft}s`}
        </span>
      </div>

      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
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
            disabled={Boolean(feedback) || isChecking || isFinishing}
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
    </section>
  );
}
