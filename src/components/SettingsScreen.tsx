"use client";

import { useState } from "react";
import type { MathOperation } from "@/lib/types";
import type { QuizPreferences } from "@/lib/preferences";

type SettingsScreenProps = {
  initialPreferences: QuizPreferences;
  onSave: (preferences: QuizPreferences) => void;
  onBack: () => void;
};

export function SettingsScreen({
  initialPreferences,
  onSave,
  onBack,
}: SettingsScreenProps) {
  const [maxNumber, setMaxNumber] = useState(initialPreferences.maxNumber);
  const [questionCount, setQuestionCount] = useState(
    initialPreferences.questionCount,
  );
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(
    initialPreferences.timeLimitSeconds,
  );
  const [operations, setOperations] = useState<MathOperation[]>([
    ...initialPreferences.operations,
  ]);
  const [error, setError] = useState<string | null>(null);

  function toggleOperation(operation: MathOperation) {
    setOperations((current) =>
      current.includes(operation)
        ? current.filter((item) => item !== operation)
        : [...current, operation],
    );
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (operations.length === 0) {
      setError("Pick at least one math operation.");
      return;
    }

    onSave({
      maxNumber,
      questionCount,
      timeLimitSeconds,
      operations,
    });
  }

  return (
    <form className="settings-screen panel pop-in" onSubmit={handleSave}>
      <header className="settings-header">
        <p className="eyebrow">Settings</p>
        <h1>Quiz setup</h1>
        <p className="lede">
          These apply to every quiz until you change them.
        </p>
      </header>

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
        <small>Ask between 1 and 20 questions.</small>
      </label>

      <label className="field">
        <span>Seconds per question</span>
        <input
          type="number"
          min={5}
          max={300}
          value={timeLimitSeconds}
          onChange={(event) => setTimeLimitSeconds(Number(event.target.value))}
          required
        />
        <small>No answer before time runs out = wrong.</small>
      </label>

      <div className="settings-math">
        <h2>Math only</h2>

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
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="settings-actions">
        <button type="button" className="secondary-btn" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="primary-btn">
          Save settings
        </button>
      </div>
    </form>
  );
}
