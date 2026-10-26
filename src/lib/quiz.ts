import { generateBanglaQuestions } from "./bangla";
import { generateEnglishQuestions } from "./english";
import type {
  MathOperation,
  PublicQuestion,
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

function buildWrongOptions(correct: number, maxNumber: number): number[] {
  const wrong = new Set<number>();
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

export function generateQuestion(
  settings: Pick<QuizSettings, "maxNumber" | "operations">,
  index: number,
): StoredQuestion {
  const operation =
    settings.operations[randomInt(0, settings.operations.length - 1)];
  const { a, b } = pickOperands(settings.maxNumber, operation);
  const correctAnswer = compute(a, b, operation);
  const options = shuffle([
    correctAnswer,
    ...buildWrongOptions(correctAnswer, settings.maxNumber),
  ]);
  const correctIndex = options.indexOf(correctAnswer);

  return {
    id: `q-${index + 1}-${Date.now()}-${randomInt(1000, 9999)}`,
    prompt: `${a} ${symbolFor(operation)} ${b} = ?`,
    options,
    correctIndex,
    correctAnswer,
  };
}

export function generateQuizQuestions(settings: QuizSettings): StoredQuestion[] {
  if (settings.subject === "bangla") {
    return generateBanglaQuestions(settings.questionCount);
  }

  if (settings.subject === "english") {
    return generateEnglishQuestions(settings.questionCount);
  }

  if (settings.subject !== "math") {
    return [];
  }

  return Array.from({ length: settings.questionCount }, (_, index) =>
    generateQuestion(settings, index),
  );
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
