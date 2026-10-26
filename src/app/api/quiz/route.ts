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

    if (settings.subject === "english") {
      return NextResponse.json(
        { error: "English questions are not available yet." },
        { status: 400 },
      );
    }

    const questions = generateQuizQuestions(settings);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions are available for this subject." },
        { status: 400 },
      );
    }
    const id = randomUUID();

    saveSession({
      id,
      settings,
      questions,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      quizId: id,
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
