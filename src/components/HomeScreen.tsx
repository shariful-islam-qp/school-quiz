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
      <div className="home-top">
        <header className="home-header">
          <p className="eyebrow">Let&apos;s play</p>
          <h1>Quiz Time</h1>
          <p className="lede">Pick a subject and start!</p>
        </header>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label="Open settings"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
          </svg>
        </button>
      </div>

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

      <p className="home-summary">
        {preferences.questionCount} questions · {preferences.timeLimitSeconds}s
        each
        {subject === "math"
          ? ` · up to ${preferences.maxNumber}`
          : null}
      </p>

      {error ? <p className="error">{error}</p> : null}

      <button
        type="button"
        className="primary-btn bounce-ready"
        disabled={isLoading}
        onClick={onStart}
      >
        {isLoading ? "Starting…" : "Start quiz"}
      </button>
    </section>
  );
}
