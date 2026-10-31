import type { QuizChoice } from "./types";

const SWATCHES: Record<string, string> = {
  Red: "#ef4444",
  Green: "#22c55e",
  Blue: "#3b82f6",
  Yellow: "#facc15",
  White: "#ffffff",
  Black: "#1f2937",
  লাল: "#ef4444",
  সবুজ: "#22c55e",
  নীল: "#3b82f6",
  হলুদ: "#facc15",
  সাদা: "#ffffff",
  কালো: "#1f2937",
  "🔴": "#ef4444",
  "🟢": "#22c55e",
  "🔵": "#3b82f6",
  "🟡": "#facc15",
  "⚪": "#ffffff",
  "⚫": "#1f2937",
};

/** Real colour for a colour name (English/Bangla) or colour-circle emoji. */
export function swatchFor(value: QuizChoice | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return SWATCHES[value.trim()] ?? null;
}
