export type QuizSubject = "math" | "english" | "bangla";

/** "numbers" = number sense: counting, comparing, order and patterns */
export type MathOperation = "addition" | "subtraction" | "numbers";

export type QuizSettings = {
  subject: QuizSubject;
  maxNumber: number;
  operations: MathOperation[];
  timeLimitSeconds: number;
  questionCount: number;
};

export type QuizChoice = string | number;

export type PublicQuestion = {
  id: string;
  prompt: string;
  options: QuizChoice[];
};

export type StoredQuestion = PublicQuestion & {
  correctIndex: number;
  correctAnswer: QuizChoice;
};

export type QuizSession = {
  id: string;
  settings: QuizSettings;
  questions: StoredQuestion[];
  createdAt: number;
};

export type AnswerSubmission = {
  questionId: string;
  /** null when the timer expired with no selection */
  selectedIndex: number | null;
};

export type QuestionResult = {
  questionId: string;
  prompt: string;
  options: QuizChoice[];
  selectedIndex: number | null;
  correctIndex: number;
  correctAnswer: QuizChoice;
  isCorrect: boolean;
  timedOut: boolean;
};

export type ScoreResult = {
  score: number;
  total: number;
  results: QuestionResult[];
};
