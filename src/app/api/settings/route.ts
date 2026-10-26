import { NextResponse } from "next/server";
import { getStoredPreferences, saveStoredPreferences } from "@/lib/db";
import {
  normalizePreferences,
  type QuizPreferences,
} from "@/lib/preferences";

export async function GET() {
  try {
    return NextResponse.json(getStoredPreferences());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<QuizPreferences>;
    const preferences = normalizePreferences(body);

    if (preferences.operations.length === 0) {
      return NextResponse.json(
        { error: "Select at least one math operation." },
        { status: 400 },
      );
    }

    return NextResponse.json(saveStoredPreferences(preferences));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
