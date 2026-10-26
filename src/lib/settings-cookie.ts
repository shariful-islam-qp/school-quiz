import type { QuizPreferences } from "./preferences";
import { normalizePreferences } from "./preferences";

export const SETTINGS_COOKIE = "quiz-settings";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function preferencesFromCookieValue(
  value: string | undefined,
): QuizPreferences | null {
  if (!value) {
    return null;
  }

  try {
    return normalizePreferences(
      JSON.parse(decodeURIComponent(value)) as Partial<QuizPreferences>,
    );
  } catch {
    return null;
  }
}

export function preferencesToCookieValue(preferences: QuizPreferences): string {
  return encodeURIComponent(JSON.stringify(preferences));
}

export function settingsCookieOptions(value: string) {
  return {
    name: SETTINGS_COOKIE,
    value,
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  };
}
