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

type Arithmetic = Exclude<MathOperation, "numbers">;

export function isMathOperation(value: unknown): value is MathOperation {
  return value === "addition" || value === "subtraction" || value === "numbers";
}

function arithmeticOf(operations: MathOperation[]): Arithmetic[] {
  return operations.filter((op): op is Arithmetic => op !== "numbers");
}

function compute(a: number, b: number, operation: Arithmetic): number {
  return operation === "addition" ? a + b : a - b;
}

function symbolFor(operation: Arithmetic): string {
  return operation === "addition" ? "+" : "−";
}

function pickOperands(
  maxNumber: number,
  operation: Arithmetic,
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
    // Go up instead of clamping at 0, which made 0 a give-away option
    const below = correct - offset;
    wrong.add(Math.random() < 0.5 && below >= 0 ? below : correct + offset);
  }

  return [...wrong];
}

const ARITHMETIC_FORMATS = [
  "equation",
  "missing",
  "story",
  "picture",
  "match",
  "truefalse",
] as const;

const NUMBER_FORMATS = [
  "count",
  "compare",
  "order",
  "pattern",
  "more",
  "numberfact",
] as const;

type NumberFormat = (typeof NUMBER_FORMATS)[number];
type MathFormat = (typeof ARITHMETIC_FORMATS)[number] | NumberFormat;

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
  operation: Arithmetic,
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
  operation: Arithmetic,
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
  operation: Arithmetic,
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
  operation: Arithmetic,
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
  operation: Arithmetic,
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

function isNumberFormat(format: MathFormat): format is NumberFormat {
  return (NUMBER_FORMATS as readonly MathFormat[]).includes(format);
}

function countDraft(maxNumber: number): MathDraft {
  // Ten is about as many as a child can count at a glance
  const limit = Math.min(maxNumber, 10);
  const count = randomInt(1, limit);
  return {
    prompt: `How many? ${pick(STORY_ITEMS).emoji.repeat(count)}`,
    correct: count,
    wrong: buildWrongOptions(count, limit, [count + 1, count - 1]),
  };
}

function compareDraft(top: number): MathDraft {
  const biggest = Math.random() < 0.5;
  const numbers = new Set<number>();
  while (numbers.size < 4) {
    numbers.add(randomInt(1, top));
  }
  const sorted = [...numbers].sort((x, y) => x - y);
  const correct = biggest ? sorted[3] : sorted[0];
  return {
    prompt: `Which number is the ${biggest ? "biggest" : "smallest"}?`,
    correct,
    wrong: sorted.filter((n) => n !== correct),
  };
}

function orderDraft(top: number): MathDraft {
  const kind = pick(["after", "before", "between"] as const);
  if (kind === "after") {
    const n = randomInt(1, top - 1);
    return {
      prompt: `What comes after ${n}?`,
      correct: n + 1,
      wrong: buildWrongOptions(n + 1, top, [n - 1, n + 2]),
    };
  }
  if (kind === "before") {
    const n = randomInt(2, top);
    return {
      prompt: `What comes before ${n}?`,
      correct: n - 1,
      wrong: buildWrongOptions(n - 1, top, [n + 1, n - 2]),
    };
  }
  const n = randomInt(2, top - 1);
  return {
    prompt: `What number is between ${n - 1} and ${n + 1}?`,
    correct: n,
    wrong: buildWrongOptions(n, top, [n + 2, n - 2]),
  };
}

function patternDraft(top: number): MathDraft {
  const steps = (top >= 50 ? [1, 2, 5, 10] : [1, 2]).filter(
    (step) => 1 + step * 3 <= top,
  );
  const step = pick(steps.length > 0 ? steps : [1]);
  const start = randomInt(1, Math.max(1, top - step * 3));
  const [first, second, third] = [start, start + step, start + step * 2];
  const correct = start + step * 3;
  return {
    prompt: `${first}, ${second}, ${third}, ?`,
    correct,
    // Common slips: counting on by one, or skipping a step
    wrong: buildWrongOptions(correct, top, [third + 1, correct + step]),
  };
}

function moreDraft(maxNumber: number): MathDraft {
  const emoji = pick(STORY_ITEMS).emoji;
  const sizes = shuffle(
    Array.from({ length: Math.min(6, Math.max(maxNumber, 4)) }, (_, i) => i + 1),
  ).slice(0, 4);
  const most = Math.max(...sizes);
  return {
    prompt: "Which group has the most?",
    correct: emoji.repeat(most),
    wrong: sizes.filter((n) => n !== most).map((n) => emoji.repeat(n)),
  };
}

function trueFalseDraft(
  a: number,
  b: number,
  operation: Arithmetic,
): MathDraft {
  const result = compute(a, b, operation);
  const isTrue = Math.random() < 0.5;
  const shown = isTrue
    ? result
    : pick([result + 1, result + 2, result - 1].filter((n) => n >= 0));
  return {
    prompt: `${a} ${symbolFor(operation)} ${b} = ${shown}. True or false?`,
    correct: isTrue ? "True" : "False",
    wrong: [isTrue ? "False" : "True"],
  };
}

function numberFactDraft(top: number): MathDraft {
  const x = randomInt(1, top);
  let y = randomInt(1, top);
  while (y === x) {
    y = randomInt(1, top);
  }
  const facts = [
    { text: `${x} is bigger than ${y}.`, isTrue: x > y },
    { text: `${x} is smaller than ${y}.`, isTrue: x < y },
    // Mostly ask about the real neighbour so "true" comes up often enough
    ...(x > 1
      ? [{ text: `${x} comes after ${x - 1}.`, isTrue: true }]
      : []),
    { text: `${x} comes after ${y}.`, isTrue: x === y + 1 },
  ];
  const fact = pick(facts);
  return {
    prompt: `${fact.text} True or false?`,
    correct: fact.isTrue ? "True" : "False",
    wrong: [fact.isTrue ? "False" : "True"],
  };
}

function numberDraft(format: NumberFormat, maxNumber: number): MathDraft {
  // Comparing and ordering need at least a handful of numbers to choose from
  const top = Math.max(maxNumber, 5);
  switch (format) {
    case "count":
      return countDraft(maxNumber);
    case "compare":
      return compareDraft(top);
    case "order":
      return orderDraft(top);
    case "pattern":
      return patternDraft(top);
    case "more":
      return moreDraft(maxNumber);
    case "numberfact":
      return numberFactDraft(top);
  }
}

function buildDraft(
  format: MathFormat,
  settings: Pick<QuizSettings, "maxNumber" | "operations">,
): MathDraft {
  const { maxNumber } = settings;
  if (isNumberFormat(format)) {
    return numberDraft(format, maxNumber);
  }

  const operation = pick(arithmeticOf(settings.operations));
  const { a, b } = pickOperands(maxNumber, operation);

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
    case "truefalse":
      return trueFalseDraft(a, b, operation);
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
  const formats = shuffle<MathFormat>([
    ...(arithmeticOf(settings.operations).length > 0 ? ARITHMETIC_FORMATS : []),
    ...(settings.operations.includes("numbers") ? NUMBER_FORMATS : []),
  ]);
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
    isMathOperation,
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
