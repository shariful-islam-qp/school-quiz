import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  type QuizPreferences,
} from "./preferences";
import type { MathOperation } from "./types";

type SettingsRow = {
  question_count: number;
  time_limit_seconds: number;
  max_number: number;
  operations: string;
};

const globalForDb = globalThis as typeof globalThis & {
  quizDb?: DatabaseSync;
};

function getDbPath(): string {
  return path.join(process.cwd(), "data", "quiz.db");
}

function createDb(): DatabaseSync {
  const dbPath = getDbPath();
  mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      question_count INTEGER NOT NULL,
      time_limit_seconds INTEGER NOT NULL,
      max_number INTEGER NOT NULL,
      operations TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const existing = db
    .prepare("SELECT id FROM quiz_settings WHERE id = 1")
    .get() as { id: number } | undefined;

  if (!existing) {
    db.prepare(
      `INSERT INTO quiz_settings (
        id, question_count, time_limit_seconds, max_number, operations, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?)`,
    ).run(
      DEFAULT_PREFERENCES.questionCount,
      DEFAULT_PREFERENCES.timeLimitSeconds,
      DEFAULT_PREFERENCES.maxNumber,
      JSON.stringify(DEFAULT_PREFERENCES.operations),
      new Date().toISOString(),
    );
  }

  return db;
}

export function getDb(): DatabaseSync {
  if (!globalForDb.quizDb) {
    globalForDb.quizDb = createDb();
  }
  return globalForDb.quizDb;
}

function rowToPreferences(row: SettingsRow): QuizPreferences {
  let operations: MathOperation[] = [...DEFAULT_PREFERENCES.operations];
  try {
    const parsed = JSON.parse(row.operations) as unknown;
    if (Array.isArray(parsed)) {
      operations = parsed.filter(
        (item): item is MathOperation =>
          item === "addition" || item === "subtraction",
      );
    }
  } catch {
    // keep defaults
  }

  return normalizePreferences({
    questionCount: row.question_count,
    timeLimitSeconds: row.time_limit_seconds,
    maxNumber: row.max_number,
    operations,
  });
}

export function getStoredPreferences(): QuizPreferences {
  const row = getDb()
    .prepare(
      `SELECT question_count, time_limit_seconds, max_number, operations
       FROM quiz_settings WHERE id = 1`,
    )
    .get() as SettingsRow | undefined;

  if (!row) {
    return normalizePreferences(DEFAULT_PREFERENCES);
  }

  return rowToPreferences(row);
}

export function saveStoredPreferences(
  preferences: QuizPreferences,
): QuizPreferences {
  const next = normalizePreferences(preferences);

  getDb()
    .prepare(
      `UPDATE quiz_settings
       SET question_count = ?,
           time_limit_seconds = ?,
           max_number = ?,
           operations = ?,
           updated_at = ?
       WHERE id = 1`,
    )
    .run(
      next.questionCount,
      next.timeLimitSeconds,
      next.maxNumber,
      JSON.stringify(next.operations),
      new Date().toISOString(),
    );

  return next;
}
