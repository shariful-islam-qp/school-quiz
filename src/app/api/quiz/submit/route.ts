import { NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/session-store";
import type {
  AnswerSubmission,
  QuestionResult,
  ScoreResult,
} from "@/lib/types";

type SubmitBody = {
  quizId?: string;
  answers?: AnswerSubmission[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;
    const { quizId, answers } = body;

    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "quizId and answers are required." },
        { status: 400 },
      );
    }

    const session = getSession(quizId);
    if (!session) {
      return NextResponse.json(
        { error: "Quiz not found or expired. Start a new quiz." },
        { status: 404 },
      );
    }

    const answerMap = new Map(
      answers.map((answer) => [answer.questionId, answer.selectedIndex]),
    );

    const results: QuestionResult[] = session.questions.map((question) => {
      const selectedIndex = answerMap.has(question.id)
        ? (answerMap.get(question.id) ?? null)
        : null;
      const timedOut = selectedIndex === null;
      const isCorrect =
        selectedIndex !== null && selectedIndex === question.correctIndex;

      return {
        questionId: question.id,
        prompt: question.prompt,
        options: question.options,
        selectedIndex,
        correctIndex: question.correctIndex,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timedOut,
      };
    });

    const score = results.filter((result) => result.isCorrect).length;
    const payload: ScoreResult = {
      score,
      total: results.length,
      results,
    };

    deleteSession(quizId);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Failed to score quiz." },
      { status: 500 },
    );
  }
}
