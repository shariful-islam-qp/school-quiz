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

    if (settings.subject !== "math") {
      return NextResponse.json(
        {
          error: `${capitalize(settings.subject)} questions are not available yet.`,
        },
        { status: 400 },
      );
    }

    const questions = generateQuizQuestions(settings);
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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
