import { NextResponse } from "next/server";
import { getSession } from "@/lib/session-store";
import type { QuestionResult } from "@/lib/types";

type CheckBody = {
  quizId?: string;
  questionId?: string;
  selectedIndex?: number | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckBody;
    const { quizId, questionId } = body;
    const selectedIndex =
      body.selectedIndex === undefined ? null : body.selectedIndex;

    if (!quizId || !questionId) {
      return NextResponse.json(
        { error: "quizId and questionId are required." },
        { status: 400 },
      );
    }

    if (
      selectedIndex !== null &&
      (!Number.isInteger(selectedIndex) || selectedIndex < 0)
    ) {
      return NextResponse.json(
        { error: "selectedIndex must be null or a non-negative integer." },
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

    const question = session.questions.find((item) => item.id === questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found in this quiz." },
        { status: 404 },
      );
    }

    if (
      selectedIndex !== null &&
      selectedIndex >= question.options.length
    ) {
      return NextResponse.json(
        { error: "selectedIndex is out of range." },
        { status: 400 },
      );
    }

    const timedOut = selectedIndex === null;
    const isCorrect =
      selectedIndex !== null && selectedIndex === question.correctIndex;

    const result: QuestionResult = {
      questionId: question.id,
      prompt: question.prompt,
      options: question.options,
      selectedIndex,
      correctIndex: question.correctIndex,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timedOut,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to check answer." },
      { status: 500 },
    );
  }
}
