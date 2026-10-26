import { createHmac, timingSafeEqual } from "crypto";
import type { QuizSession } from "./types";

const SESSION_TTL_MS = 60 * 60 * 1000;

function getSecret(): string {
  return (
    process.env.QUIZ_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-quiz-secret-change-me"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function saveSession(session: QuizSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function getSession(token: string): QuizSession | undefined {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return undefined;
  }

  const [payload, signature] = parts;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return undefined;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as QuizSession;

    if (!session?.id || !Array.isArray(session.questions)) {
      return undefined;
    }

    if (Date.now() - session.createdAt > SESSION_TTL_MS) {
      return undefined;
    }

    return session;
  } catch {
    return undefined;
  }
}

export function deleteSession(_token: string): void {
  // Stateless signed sessions expire on their own.
}
