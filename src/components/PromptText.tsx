import { swatchFor } from "@/lib/colors";

const ONE_EMOJI =
  /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu;
// "▭" is not an emoji, but it stands for a rectangle in shape questions
const EMOJI_RUN = new RegExp(`((?:${ONE_EMOJI.source})+|▭)`, "u");

/** Shape-question symbols drawn as solid shapes, like a worksheet picture. */
const SHAPES: Record<string, string> = {
  "⭕": "circle",
  "⬜": "square",
  "🔺": "triangle",
  "▭": "rectangle",
};

export function emojiCount(text: string): number {
  return text.match(ONE_EMOJI)?.length ?? 0;
}

/** True for picture answers like "🐴" that should render large. */
export function isEmojiOnly(value: string | number): boolean {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    value.replace(ONE_EMOJI, "").trim() === ""
  );
}

/** True when the prompt itself shows a colour, e.g. "এটা কোন রঙ? 🔴". */
export function promptShowsColor(prompt: string): boolean {
  return prompt.split(EMOJI_RUN).some((part) => swatchFor(part) !== null);
}

/**
 * Renders a prompt with emoji enlarged and colour-circle emoji replaced by a
 * real colour swatch (emoji circles render inconsistently, e.g. ⚪ on white).
 */
export function PromptText({ text }: { text: string }) {
  // split() with a capture group puts emoji runs at the odd indexes
  return text.split(EMOJI_RUN).map((part, index) => {
    if (index % 2 === 0) {
      return part;
    }

    const shape = SHAPES[part];
    if (shape) {
      return (
        <span
          key={index}
          className={`shape shape-${shape}`}
          role="img"
          aria-label="shape"
        />
      );
    }

    const swatch = swatchFor(part);
    if (swatch) {
      return (
        <span
          key={index}
          className="color-swatch color-swatch-lg"
          style={{ background: swatch }}
          role="img"
          aria-label="colour"
        />
      );
    }

    // Counting rows (🍬🍬🍬🍬…) stay smaller so a group fits on one line
    const isRow = emojiCount(part) > 3;
    return (
      <span
        key={index}
        className={isRow ? "prompt-emoji prompt-emoji-row" : "prompt-emoji"}
      >
        {part}
      </span>
    );
  });
}

export function ColorChip({ color }: { color: string }) {
  return (
    <span
      className="color-swatch color-swatch-sm"
      style={{ background: color }}
      aria-hidden
    />
  );
}
