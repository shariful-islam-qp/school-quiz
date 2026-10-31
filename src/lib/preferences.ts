import type { MathOperation, QuizSettings } from "./types";
import { DEFAULT_SETTINGS, isMathOperation } from "./quiz";

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

export function normalizePreferences(
  input: Partial<QuizPreferences> | null | undefined,
): QuizPreferences {
  const operations = (input?.operations ?? DEFAULT_PREFERENCES.operations).filter(
    isMathOperation,
  );

  return {
    maxNumber: clampInt(
      input?.maxNumber ?? DEFAULT_PREFERENCES.maxNumber,
      2,
      100,
    ),
    timeLimitSeconds: clampInt(
      input?.timeLimitSeconds ?? DEFAULT_PREFERENCES.timeLimitSeconds,
      5,
      300,
    ),
    questionCount: clampInt(
      input?.questionCount ?? DEFAULT_PREFERENCES.questionCount,
      1,
      20,
    ),
    operations:
      operations.length > 0
        ? operations
        : [...DEFAULT_PREFERENCES.operations],
  };
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
