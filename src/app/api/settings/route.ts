import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  normalizePreferences,
  type QuizPreferences,
} from "@/lib/preferences";
import {
  readStoredPreferences,
  writeStoredPreferences,
} from "@/lib/settings-store";
import {
  preferencesFromCookieValue,
  preferencesToCookieValue,
  SETTINGS_COOKIE,
  settingsCookieOptions,
} from "@/lib/settings-cookie";

export async function GET() {
  try {
    const jar = await cookies();
    const fromCookie = preferencesFromCookieValue(
      jar.get(SETTINGS_COOKIE)?.value,
    );
    if (fromCookie) {
      return NextResponse.json(fromCookie);
    }

    return NextResponse.json(await readStoredPreferences());
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

    const saved = await writeStoredPreferences(preferences);
    const response = NextResponse.json(saved);
    response.cookies.set(
      settingsCookieOptions(preferencesToCookieValue(saved)),
    );
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
