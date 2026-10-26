import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  generateQuizQuestions,
  normalizeSettings,
  toPublicQuestion,
} from "@/lib/quiz";
import { saveSession } from "@/lib/session-store";
import type { QuizSettings } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<QuizSettings>;
    const settings = normalizeSettings(body);

    const questions = await generateQuizQuestions(settings);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions are available for this subject." },
        { status: 400 },
      );
    }
    const id = randomUUID();
    const quizId = saveSession({
      id,
      settings: {
        subject: settings.subject,
        timeLimitSeconds: settings.timeLimitSeconds,
        questionCount: settings.questionCount,
        maxNumber: settings.maxNumber,
        operations: settings.operations,
      },
      questions: questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        correctIndex: question.correctIndex,
        correctAnswer: question.correctAnswer,
      })),
      createdAt: Date.now(),
    });

    return NextResponse.json({
      quizId,
      subject: settings.subject,
      timeLimitSeconds: settings.timeLimitSeconds,
      questions: questions.map(toPublicQuestion),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create quiz.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
