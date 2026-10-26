import type { MathOperation, QuizSettings } from "./types";
import { DEFAULT_SETTINGS } from "./quiz";

const STORAGE_KEY = "school-quiz-preferences";

export type QuizPreferences = {
  maxNumber: number;
  operations: MathOperation[];
  timeLimitSeconds: number;
  questionCount: number;
};

export const DEFAULT_PREFERENCES: QuizPreferences = {
  maxNumber: DEFAULT_SETTINGS.maxNumber,
  operations: [...DEFAULT_SETTINGS.operations],
  timeLimitSeconds: DEFAULT_SETTINGS.timeLimitSeconds,
  questionCount: DEFAULT_SETTINGS.questionCount,
};

function isMathOperation(value: unknown): value is MathOperation {
  return value === "addition" || value === "subtraction";
}

export function loadPreferences(): QuizPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PREFERENCES, operations: [...DEFAULT_PREFERENCES.operations] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES, operations: [...DEFAULT_PREFERENCES.operations] };
    }

    const parsed = JSON.parse(raw) as Partial<QuizPreferences>;
    const operations = (parsed.operations ?? DEFAULT_PREFERENCES.operations).filter(
      isMathOperation,
    );

    return {
      maxNumber: clampInt(
        parsed.maxNumber ?? DEFAULT_PREFERENCES.maxNumber,
        2,
        100,
      ),
      timeLimitSeconds: clampInt(
        parsed.timeLimitSeconds ?? DEFAULT_PREFERENCES.timeLimitSeconds,
        5,
        300,
      ),
      questionCount: clampInt(
        parsed.questionCount ?? DEFAULT_PREFERENCES.questionCount,
        1,
        20,
      ),
      operations:
        operations.length > 0
          ? operations
          : [...DEFAULT_PREFERENCES.operations],
    };
  } catch {
    return { ...DEFAULT_PREFERENCES, operations: [...DEFAULT_PREFERENCES.operations] };
  }
}

export function savePreferences(preferences: QuizPreferences): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function preferencesToSettings(
  subject: QuizSettings["subject"],
  preferences: QuizPreferences,
): QuizSettings {
  return {
    subject,
    maxNumber: preferences.maxNumber,
    operations: preferences.operations,
    timeLimitSeconds: preferences.timeLimitSeconds,
    questionCount: preferences.questionCount,
  };
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}
