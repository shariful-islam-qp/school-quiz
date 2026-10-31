import type {
  MathOperation,
  PublicQuestion,
  QuizChoice,
  QuizSettings,
  QuizSubject,
  StoredQuestion,
} from "./types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function compute(a: number, b: number, operation: MathOperation): number {
  return operation === "addition" ? a + b : a - b;
}

function symbolFor(operation: MathOperation): string {
  return operation === "addition" ? "+" : "−";
}

function pickOperands(
  maxNumber: number,
  operation: MathOperation,
): { a: number; b: number } {
  if (operation === "subtraction") {
    const a = randomInt(1, maxNumber);
    const b = randomInt(0, a);
    return { a, b };
  }

  return {
    a: randomInt(1, maxNumber),
    b: randomInt(1, maxNumber),
  };
}

/**
 * Mix in up to two "likely mistake" answers (off by one, wrong operation)
 * so options are not trivially easy to eliminate, then fill the rest randomly.
 */
function buildWrongOptions(
  correct: number,
  maxNumber: number,
  likelyMistakes: number[] = [],
): number[] {
  const wrong = new Set<number>();
  const near = shuffle([...likelyMistakes, correct + 1, correct - 1, correct + 2]);

  for (const candidate of near) {
    if (wrong.size >= 2) {
      break;
    }
    if (candidate >= 0 && candidate !== correct) {
      wrong.add(candidate);
    }
  }

  const spread = Math.max(3, maxNumber);

  while (wrong.size < 3) {
    const offset = randomInt(1, spread);
    const candidate =
      Math.random() < 0.5 ? correct + offset : Math.max(0, correct - offset);
    if (candidate !== correct) {
      wrong.add(candidate);
    }
  }

  return [...wrong];
}

type MathFormat = "equation" | "missing" | "story" | "picture" | "match";

const MATH_FORMATS: MathFormat[] = [
  "equation",
  "missing",
  "story",
  "picture",
  "match",
];

type MathDraft = {
  prompt: string;
  correct: QuizChoice;
  wrong: QuizChoice[];
};

const STORY_ITEMS = [
  { emoji: "🍎", one: "apple", many: "apples" },
  { emoji: "⭐", one: "star", many: "stars" },
  { emoji: "🎈", one: "balloon", many: "balloons" },
  { emoji: "🍬", one: "candy", many: "candies" },
  { emoji: "⚽", one: "ball", many: "balls" },
  { emoji: "✏️", one: "pencil", many: "pencils" },
  { emoji: "🌸", one: "flower", many: "flowers" },
  { emoji: "🐟", one: "fish", many: "fish" },
];

const STORY_NAMES = ["Rina", "Rafi", "Mitu", "Tanvir", "Nila", "Arif", "Sumi", "Joy"];

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function equationDraft(
  a: number,
  b: number,
  operation: MathOperation,
  maxNumber: number,
): MathDraft {
  const correct = compute(a, b, operation);
  const otherOperation = Math.abs(
    compute(a, b, operation === "addition" ? "subtraction" : "addition"),
  );
  return {
    prompt: `${a} ${symbolFor(operation)} ${b} = ?`,
    correct,
    wrong: buildWrongOptions(correct, maxNumber, [otherOperation]),
  };
}

function missingDraft(
  a: number,
  b: number,
  operation: MathOperation,
  maxNumber: number,
): MathDraft {
  const result = compute(a, b, operation);
  const symbol = symbolFor(operation);
  const hideFirst = Math.random() < 0.5;
  const correct = hideFirst ? a : b;
  // Common slip: combining the two visible numbers instead of solving
  const shown = hideFirst ? b : a;
  return {
    prompt: hideFirst
      ? `? ${symbol} ${b} = ${result}`
      : `${a} ${symbol} ? = ${result}`,
    correct,
    wrong: buildWrongOptions(correct, maxNumber, [result + shown]),
  };
}

function storyDraft(
  a: number,
  b: number,
  operation: MathOperation,
  maxNumber: number,
): MathDraft {
  const item = pick(STORY_ITEMS);
  const name = pick(STORY_NAMES);
  const count = (n: number) => `${n} ${n === 1 ? item.one : item.many}`;
  const isAre = (n: number) => (n === 1 ? "is" : "are");
  const additionStories = [
    `${name} has ${count(a)} ${item.emoji} and gets ${b} more. How many ${item.many} now?`,
    `There ${isAre(a)} ${count(a)} in a box and ${count(b)} on the table. How many ${item.many} in all? ${item.emoji}`,
  ];
  const subtractionStories = [
    `${name} has ${count(a)} ${item.emoji} and gives away ${b}. How many are left?`,
    `There ${isAre(a)} ${count(a)} ${item.emoji}. ${b} ${isAre(b)} taken away. How many are left?`,
  ];
  const correct = compute(a, b, operation);
  return {
    prompt: pick(
      operation === "addition" ? additionStories : subtractionStories,
    ),
    correct,
    wrong: buildWrongOptions(correct, maxNumber, [
      operation === "addition" ? a - b : a + b,
    ]),
  };
}

function pictureDraft(
  a: number,
  b: number,
  operation: MathOperation,
  maxNumber: number,
): MathDraft {
  const emoji = pick(STORY_ITEMS).emoji;
  const correct = compute(a, b, operation);
  return {
    prompt: `${emoji.repeat(a)} ${symbolFor(operation)} ${emoji.repeat(b)} = ?`,
    correct,
    wrong: buildWrongOptions(correct, maxNumber),
  };
}

function matchDraft(
  a: number,
  b: number,
  operation: MathOperation,
  maxNumber: number,
): MathDraft {
  const target = compute(a, b, operation);
  const symbol = symbolFor(operation);
  const correct = `${a} ${symbol} ${b}`;
  const wrong = new Set<string>();

  for (let attempt = 0; attempt < 50 && wrong.size < 3; attempt += 1) {
    const other = pickOperands(maxNumber, operation);
    if (compute(other.a, other.b, operation) !== target) {
      wrong.add(`${other.a} ${symbol} ${other.b}`);
    }
  }

  if (wrong.size < 3) {
    return equationDraft(a, b, operation, maxNumber);
  }

  return {
    prompt: `Which one makes ${target}?`,
    correct,
    wrong: [...wrong],
  };
}

function buildDraft(
  format: MathFormat,
  settings: Pick<QuizSettings, "maxNumber" | "operations">,
): MathDraft {
  const operation = pick(settings.operations);
  const { a, b } = pickOperands(settings.maxNumber, operation);
  const { maxNumber } = settings;

  switch (format) {
    case "missing":
      return missingDraft(a, b, operation, maxNumber);
    case "story":
      // "gives away 0" reads oddly, so stories need a real change
      return b > 0
        ? storyDraft(a, b, operation, maxNumber)
        : equationDraft(a, b, operation, maxNumber);
    case "picture": {
      // Keep emoji rows short enough to count at a glance
      const fits = b > 0 && a <= 10 && (operation === "subtraction" || a + b <= 12);
      return fits
        ? pictureDraft(a, b, operation, maxNumber)
        : equationDraft(a, b, operation, maxNumber);
    }
    case "match":
      return matchDraft(a, b, operation, maxNumber);
    default:
      return equationDraft(a, b, operation, maxNumber);
  }
}

export function generateQuestion(
  settings: Pick<QuizSettings, "maxNumber" | "operations">,
  index: number,
  format: MathFormat = "equation",
): StoredQuestion {
  const draft = buildDraft(format, settings);
  const options = shuffle([draft.correct, ...draft.wrong]);

  return {
    id: `q-${index + 1}-${Date.now()}-${randomInt(1000, 9999)}`,
    prompt: draft.prompt,
    options,
    correctIndex: options.indexOf(draft.correct),
    correctAnswer: draft.correct,
  };
}

function generateMathQuestions(settings: QuizSettings): StoredQuestion[] {
  // Rotate through a shuffled format list so every quiz mixes question styles
  const formats = shuffle(MATH_FORMATS);
  const seen = new Set<string>();
  const questions: StoredQuestion[] = [];

  for (let index = 0; index < settings.questionCount; index += 1) {
    const format = formats[index % formats.length];
    let question = generateQuestion(settings, index, format);
    for (let retry = 0; retry < 10 && seen.has(question.prompt); retry += 1) {
      question = generateQuestion(settings, index, format);
    }
    seen.add(question.prompt);
    questions.push(question);
  }

  return questions;
}

export async function generateQuizQuestions(
  settings: QuizSettings,
): Promise<StoredQuestion[]> {
  if (settings.subject === "bangla") {
    const { generateBanglaQuestions } = await import("./bangla");
    return generateBanglaQuestions(settings.questionCount);
  }

  if (settings.subject === "english") {
    const { generateEnglishQuestions } = await import("./english");
    return generateEnglishQuestions(settings.questionCount);
  }

  if (settings.subject !== "math") {
    return [];
  }

  return generateMathQuestions(settings);
}

export function toPublicQuestion(question: StoredQuestion): PublicQuestion {
  return {
    id: question.id,
    prompt: question.prompt,
    options: question.options,
  };
}

export const DEFAULT_SETTINGS: QuizSettings = {
  subject: "math",
  maxNumber: 10,
  operations: ["addition", "subtraction"],
  timeLimitSeconds: 60,
  questionCount: 5,
};

function isQuizSubject(value: unknown): value is QuizSubject {
  return value === "math" || value === "english" || value === "bangla";
}

export function normalizeSettings(input: Partial<QuizSettings>): QuizSettings {
  const subject = isQuizSubject(input.subject)
    ? input.subject
    : DEFAULT_SETTINGS.subject;

  const maxNumber = clampInt(input.maxNumber ?? DEFAULT_SETTINGS.maxNumber, 2, 100);
  const timeLimitSeconds = clampInt(
    input.timeLimitSeconds ?? DEFAULT_SETTINGS.timeLimitSeconds,
    5,
    300,
  );
  const questionCount = clampInt(
    input.questionCount ?? DEFAULT_SETTINGS.questionCount,
    1,
    20,
  );

  const operations = (input.operations ?? DEFAULT_SETTINGS.operations).filter(
    (op): op is MathOperation => op === "addition" || op === "subtraction",
  );

  if (subject === "math" && operations.length === 0) {
    throw new Error("Select at least one operation.");
  }

  return {
    subject,
    maxNumber,
    operations:
      operations.length > 0 ? operations : [...DEFAULT_SETTINGS.operations],
    timeLimitSeconds,
    questionCount,
  };
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}
