export type QuizSubject = "math" | "english" | "bangla";

export type MathOperation = "addition" | "subtraction";

export type QuizSettings = {
  subject: QuizSubject;
  maxNumber: number;
  operations: MathOperation[];
  timeLimitSeconds: number;
  questionCount: number;
};

export type PublicQuestion = {
  id: string;
  prompt: string;
  options: number[];
};

export type StoredQuestion = PublicQuestion & {
  correctIndex: number;
  correctAnswer: number;
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
  options: number[];
  selectedIndex: number | null;
  correctIndex: number;
  correctAnswer: number;
  isCorrect: boolean;
  timedOut: boolean;
};

export type ScoreResult = {
  score: number;
  total: number;
  results: QuestionResult[];
};
