"use client";

import { useState } from "react";
import type { MathOperation, QuizSettings, QuizSubject } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/quiz";

type SettingsFormProps = {
  onStart: (settings: QuizSettings) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const SUBJECTS: { value: QuizSubject; label: string }[] = [
  { value: "math", label: "Math" },
  { value: "english", label: "English" },
  { value: "bangla", label: "Bangla" },
];

export function SettingsForm({ onStart, isLoading, error }: SettingsFormProps) {
  const [subject, setSubject] = useState<QuizSubject>(DEFAULT_SETTINGS.subject);
  const [maxNumber, setMaxNumber] = useState(DEFAULT_SETTINGS.maxNumber);
  const [questionCount, setQuestionCount] = useState(
    DEFAULT_SETTINGS.questionCount,
  );
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(
    DEFAULT_SETTINGS.timeLimitSeconds,
  );
  const [operations, setOperations] = useState<MathOperation[]>([
    ...DEFAULT_SETTINGS.operations,
  ]);

  const isMath = subject === "math";
  const isBangla = subject === "bangla";
  const canStart = (isMath || isBangla) && !isLoading;

  function toggleOperation(operation: MathOperation) {
    setOperations((current) =>
      current.includes(operation)
        ? current.filter((item) => item !== operation)
        : [...current, operation],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isMath && !isBangla) {
      return;
    }

    await onStart({
      subject,
      maxNumber,
      timeLimitSeconds,
      operations,
      questionCount,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      <header className="settings-header">
        <p className="eyebrow">School practice</p>
        <h1>Quiz</h1>
        <p className="lede">
          Four choices per question. Beat the clock.
        </p>
      </header>

      <fieldset className="field">
        <legend>Subject</legend>
        <div className="checkbox-row subject-row">
          {SUBJECTS.map((item) => (
            <label key={item.value}>
              <input
                type="radio"
                name="subject"
                value={item.value}
                checked={subject === item.value}
                onChange={() => setSubject(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
        {subject === "english" ? (
          <small>No questions yet for this subject.</small>
        ) : null}
      </fieldset>

      {isMath ? (
        <>
          <label className="field">
            <span>Number range (1 to…)</span>
            <input
              type="number"
              min={2}
              max={100}
              value={maxNumber}
              onChange={(event) => setMaxNumber(Number(event.target.value))}
              required
            />
            <small>Example: 10 → numbers from 1 to 10</small>
          </label>

          <label className="field">
            <span>Number of questions</span>
            <input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              required
            />
            <small>Default 5. Ask between 1 and 20 questions.</small>
          </label>

          <fieldset className="field">
            <legend>Operations</legend>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={operations.includes("addition")}
                  onChange={() => toggleOperation("addition")}
                />
                Addition (+)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={operations.includes("subtraction")}
                  onChange={() => toggleOperation("subtraction")}
                />
                Subtraction (−)
              </label>
            </div>
          </fieldset>

          <label className="field">
            <span>Seconds per question</span>
            <input
              type="number"
              min={5}
              max={300}
              value={timeLimitSeconds}
              onChange={(event) =>
                setTimeLimitSeconds(Number(event.target.value))
              }
              required
            />
            <small>Default 60. No answer before time runs out = wrong.</small>
          </label>
        </>
      ) : null}

      {isBangla ? (
        <>
          <label className="field">
            <span>Number of questions</span>
            <input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              required
            />
            <small>Default 5. Ask between 1 and 20 questions.</small>
          </label>

          <label className="field">
            <span>Seconds per question</span>
            <input
              type="number"
              min={5}
              max={300}
              value={timeLimitSeconds}
              onChange={(event) =>
                setTimeLimitSeconds(Number(event.target.value))
              }
              required
            />
            <small>Default 60. No answer before time runs out = wrong.</small>
          </label>
        </>
      ) : null}

      {error ? <p className="error">{error}</p> : null}

      <button type="submit" className="primary-btn" disabled={!canStart}>
        {isLoading
          ? "Starting…"
          : isMath || isBangla
            ? "Start quiz"
            : "Coming soon"}
      </button>
    </form>
  );
}
