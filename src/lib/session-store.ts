import type { QuizSession } from "./types";

const SESSION_TTL_MS = 60 * 60 * 1000;

type GlobalStore = {
  quizSessions?: Map<string, QuizSession>;
};

function getStore(): Map<string, QuizSession> {
  const globalRef = globalThis as typeof globalThis & GlobalStore;
  if (!globalRef.quizSessions) {
    globalRef.quizSessions = new Map();
  }
  return globalRef.quizSessions;
}

function pruneExpired(store: Map<string, QuizSession>) {
  const now = Date.now();
  for (const [id, session] of store) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      store.delete(id);
    }
  }
}

export function saveSession(session: QuizSession): void {
  const store = getStore();
  pruneExpired(store);
  store.set(session.id, session);
}

export function getSession(id: string): QuizSession | undefined {
  const store = getStore();
  pruneExpired(store);
  return store.get(id);
}

export function deleteSession(id: string): void {
  getStore().delete(id);
}
