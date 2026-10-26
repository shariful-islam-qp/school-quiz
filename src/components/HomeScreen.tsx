"use client";

import type { QuizSubject } from "@/lib/types";
import type { QuizPreferences } from "@/lib/preferences";

type HomeScreenProps = {
  subject: QuizSubject;
  preferences: QuizPreferences;
  isLoading: boolean;
  error: string | null;
  onSubjectChange: (subject: QuizSubject) => void;
  onOpenSettings: () => void;
  onStart: () => void;
};

const SUBJECTS: {
  value: QuizSubject;
  label: string;
  hint: string;
  badge: string;
  tone: string;
}[] = [
  {
    value: "math",
    label: "Math",
    hint: "Add & subtract",
    badge: "123",
    tone: "math",
  },
  {
    value: "english",
    label: "English",
    hint: "Letters & words",
    badge: "ABC",
    tone: "english",
  },
  {
    value: "bangla",
    label: "Bangla",
    hint: "অ আ ক খ",
    badge: "অআ",
    tone: "bangla",
  },
];

export function HomeScreen({
  subject,
  preferences,
  isLoading,
  error,
  onSubjectChange,
  onOpenSettings,
  onStart,
}: HomeScreenProps) {
  return (
    <section className="home-screen panel pop-in">
      <header className="home-header">
        <p className="eyebrow">Let&apos;s play</p>
        <h1>Quiz Time</h1>
        <p className="lede">Pick a subject and start!</p>
      </header>

      <div className="subject-grid" role="radiogroup" aria-label="Subject">
        {SUBJECTS.map((item, index) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={subject === item.value}
            className={`subject-card tone-${item.tone} ${
              subject === item.value ? "is-selected" : ""
            }`}
            style={{ animationDelay: `${120 + index * 90}ms` }}
            onClick={() => onSubjectChange(item.value)}
          >
            <span className="subject-badge">{item.badge}</span>
            <strong>{item.label}</strong>
            <small>{item.hint}</small>
          </button>
        ))}
      </div>

      <div className="home-summary-card">
        <p className="home-summary">
          {preferences.questionCount} questions · {preferences.timeLimitSeconds}
          s each
          {subject === "math" ? ` · up to ${preferences.maxNumber}` : null}
        </p>
        <button
          type="button"
          className="settings-link-btn"
          onClick={onOpenSettings}
        >
          Change settings
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="home-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={onOpenSettings}
        >
          Settings
        </button>
        <button
          type="button"
          className="primary-btn bounce-ready"
          disabled={isLoading}
          onClick={onStart}
        >
          {isLoading ? "Starting…" : "Start quiz"}
        </button>
      </div>
    </section>
  );
}
