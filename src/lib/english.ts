import type { StoredQuestion } from "./types";

type EnglishDraft = {
  prompt: string;
  correct: string;
  distractors: string[];
};

const CAPITALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const SMALLS = "abcdefghijklmnopqrstuvwxyz".split("");

const WORDS = [
  { emoji: "🍎", word: "Apple" },
  { emoji: "⚽", word: "Ball" },
  { emoji: "🐈", word: "Cat" },
  { emoji: "🐶", word: "Dog" },
  { emoji: "🥭", word: "Mango" },
  { emoji: "📖", word: "Book" },
  { emoji: "🍌", word: "Banana" },
  { emoji: "🐟", word: "Fish" },
  { emoji: "🏠", word: "House" },
  { emoji: "🌳", word: "Tree" },
  { emoji: "☀️", word: "Sun" },
  { emoji: "🌙", word: "Moon" },
];

const COLOURS = [
  { prompt: "What colour is an apple?", correct: "Red", distractors: ["Blue", "Green", "Yellow"] },
  { prompt: "What colour is the sky?", correct: "Blue", distractors: ["Red", "Yellow", "Black"] },
  { prompt: "What colour is a banana?", correct: "Yellow", distractors: ["Red", "Blue", "Green"] },
  { prompt: "What colour is a leaf?", correct: "Green", distractors: ["Red", "Blue", "Yellow"] },
  { prompt: "What colour is the sun?", correct: "Yellow", distractors: ["Blue", "Green", "Black"] },
  { prompt: "What colour is milk?", correct: "White", distractors: ["Black", "Red", "Blue"] },
];

const SHAPES = [
  { emoji: "⭕", word: "Circle" },
  { emoji: "⬜", word: "Square" },
  { emoji: "🔺", word: "Triangle" },
  { emoji: "▭", word: "Rectangle" },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueOthers(pool: string[], correct: string): string[] {
  return [...new Set(pool.filter((item) => item !== correct))];
}

function alphabetSequenceDrafts(): EnglishDraft[] {
  const drafts: EnglishDraft[] = [];

  for (let index = 0; index < CAPITALS.length - 3; index += 1) {
    const shown = CAPITALS.slice(index, index + 3).join(", ");
    const correct = CAPITALS[index + 3];
    drafts.push({
      prompt: `${shown} — what comes next?`,
      correct,
      distractors: uniqueOthers(CAPITALS, correct),
    });
  }

  // “Say A to Z” style: recognise the correct opening sequence
  drafts.push({
    prompt: "Which sequence starts the alphabet?",
    correct: "A, B, C, D",
    distractors: ["B, C, D, E", "A, C, D, E", "a, b, c, d"],
  });

  return drafts;
}

// Show one case and ask for the other. The same letter in the shown case is
// always a distractor, so the child has to tell capital and small apart.
function identifyCapitalDrafts(): EnglishDraft[] {
  return CAPITALS.map((letter, index) => ({
    prompt: `Find the capital letter for “${SMALLS[index]}”`,
    correct: letter,
    distractors: [
      SMALLS[index],
      ...shuffle(uniqueOthers(CAPITALS, letter)).slice(0, 2),
    ],
  }));
}

function identifySmallDrafts(): EnglishDraft[] {
  return SMALLS.map((letter, index) => ({
    prompt: `Find the small letter for “${CAPITALS[index]}”`,
    correct: letter,
    distractors: [
      CAPITALS[index],
      ...shuffle(uniqueOthers(SMALLS, letter)).slice(0, 2),
    ],
  }));
}

function afterLetterDrafts(): EnglishDraft[] {
  return CAPITALS.slice(0, -1).map((letter, index) => ({
    prompt: `What comes after ${letter}?`,
    correct: CAPITALS[index + 1],
    distractors: uniqueOthers(CAPITALS, CAPITALS[index + 1]),
  }));
}

function beforeLetterDrafts(): EnglishDraft[] {
  return CAPITALS.slice(1).map((letter, index) => ({
    prompt: `What comes before ${letter}?`,
    correct: CAPITALS[index],
    distractors: uniqueOthers(CAPITALS, CAPITALS[index]),
  }));
}

function vocabularyDrafts(): EnglishDraft[] {
  return WORDS.map((item) => ({
    prompt: `What is this? ${item.emoji}`,
    correct: item.word,
    distractors: uniqueOthers(
      WORDS.map((other) => other.word),
      item.word,
    ),
  }));
}

function colourDrafts(): EnglishDraft[] {
  return COLOURS.map((item) => ({
    prompt: item.prompt,
    correct: item.correct,
    distractors: item.distractors,
  }));
}

function shapeDrafts(): EnglishDraft[] {
  return SHAPES.map((item) => ({
    prompt: `What shape is this? ${item.emoji}`,
    correct: item.word,
    distractors: uniqueOthers(
      SHAPES.map((other) => other.word),
      item.word,
    ),
  }));
}

function takeDrafts(count: number): EnglishDraft[] {
  const perBucket = Math.max(2, Math.ceil(count / 3));
  const buckets = shuffle([
    shuffle(alphabetSequenceDrafts()).slice(0, perBucket),
    shuffle(identifyCapitalDrafts()).slice(0, perBucket),
    shuffle(identifySmallDrafts()).slice(0, perBucket),
    shuffle(afterLetterDrafts()).slice(0, perBucket),
    shuffle(beforeLetterDrafts()).slice(0, perBucket),
    shuffle(vocabularyDrafts()).slice(0, perBucket),
    shuffle(colourDrafts()).slice(0, perBucket),
    shuffle(shapeDrafts()).slice(0, perBucket),
  ]);

  const picked: EnglishDraft[] = [];
  const seen = new Set<string>();
  let progressed = true;

  while (picked.length < count && progressed) {
    progressed = false;
    for (const bucket of buckets) {
      while (bucket.length > 0) {
        const next = bucket.pop();
        if (!next || seen.has(next.prompt)) {
          continue;
        }
        seen.add(next.prompt);
        picked.push(next);
        progressed = true;
        break;
      }
      if (picked.length >= count) {
        break;
      }
    }
  }

  return shuffle(picked);
}

function toQuestion(draft: EnglishDraft, index: number): StoredQuestion {
  const options = shuffle([
    draft.correct,
    ...shuffle(draft.distractors).slice(0, 3),
  ]);

  return {
    id: `q-${index + 1}-${Date.now()}-${randomInt(1000, 9999)}`,
    prompt: draft.prompt,
    options,
    correctIndex: options.indexOf(draft.correct),
    correctAnswer: draft.correct,
  };
}

export function generateEnglishQuestions(count: number): StoredQuestion[] {
  return takeDrafts(count).map(toQuestion);
}
