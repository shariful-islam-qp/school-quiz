import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  type QuizPreferences,
} from "./preferences";

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function readStoredPreferences(): Promise<QuizPreferences> {
  if (isServerless()) {
    return normalizePreferences(DEFAULT_PREFERENCES);
  }

  const { getStoredPreferences } = await import("./db");
  return getStoredPreferences();
}

export async function writeStoredPreferences(
  preferences: QuizPreferences,
): Promise<QuizPreferences> {
  const next = normalizePreferences(preferences);
  if (isServerless()) {
    return next;
  }

  const { saveStoredPreferences } = await import("./db");
  return saveStoredPreferences(next);
}
