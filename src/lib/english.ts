import {
  CATEGORY_PICTURES,
  categoryDistractors,
  type PictureCategory,
  SIZE_TIERS,
} from "./picture-groups";
import type { StoredQuestion } from "./types";

type EnglishDraft = {
  prompt: string;
  correct: string;
  distractors: string[];
};

const CAPITALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const SMALLS = "abcdefghijklmnopqrstuvwxyz".split("");

type EnglishWord = {
  emoji: string;
  word: string;
  /** First letters of other names a child might give the picture (🐶 → Puppy) */
  alt?: string[];
};

// A–Z picture words (no X: there is no clear picture for it)
const WORDS: EnglishWord[] = [
  { emoji: "🍎", word: "Apple" },
  { emoji: "⚽", word: "Ball" },
  { emoji: "🍌", word: "Banana" },
  { emoji: "📖", word: "Book" },
  { emoji: "🐈", word: "Cat", alt: ["K"] },
  { emoji: "🐶", word: "Dog", alt: ["P"] },
  { emoji: "🥚", word: "Egg" },
  { emoji: "🐟", word: "Fish" },
  { emoji: "🐐", word: "Goat" },
  { emoji: "🎩", word: "Hat", alt: ["C"] },
  { emoji: "🏠", word: "House" },
  { emoji: "🍦", word: "Ice cream", alt: ["C"] },
  { emoji: "🧃", word: "Juice", alt: ["D", "B"] },
  { emoji: "🪁", word: "Kite" },
  { emoji: "🦁", word: "Lion" },
  { emoji: "🥭", word: "Mango" },
  { emoji: "🌙", word: "Moon" },
  { emoji: "👃", word: "Nose" },
  { emoji: "🍊", word: "Orange" },
  { emoji: "🐷", word: "Pig" },
  { emoji: "👸", word: "Queen", alt: ["P"] },
  { emoji: "🐇", word: "Rabbit", alt: ["B"] },
  { emoji: "☀️", word: "Sun" },
  { emoji: "🌳", word: "Tree" },
  { emoji: "☂️", word: "Umbrella" },
  { emoji: "🚐", word: "Van", alt: ["B", "C"] },
  { emoji: "⌚", word: "Watch", alt: ["C"] },
  { emoji: "🪀", word: "Yo-yo" },
  { emoji: "🦓", word: "Zebra" },
];

const BODY_PARTS = [
  { emoji: "👁️", word: "Eye" },
  { emoji: "👂", word: "Ear" },
  { emoji: "👃", word: "Nose" },
  { emoji: "👄", word: "Mouth" },
  { emoji: "✋", word: "Hand" },
  { emoji: "🦶", word: "Foot" },
];

const ANIMAL_SOUNDS = [
  { emoji: "🐄", sound: "Moo" },
  { emoji: "🐶", sound: "Woof" },
  { emoji: "🐈", sound: "Meow" },
  { emoji: "🐑", sound: "Baa" },
  { emoji: "🦆", sound: "Quack" },
  { emoji: "🐓", sound: "Cock-a-doodle-doo" },
  { emoji: "🦁", sound: "Roar" },
  { emoji: "🐷", sound: "Oink" },
];

const CATEGORY_PROMPTS: Record<PictureCategory, string> = {
  fruit: "Which one is a fruit?",
  animal: "Which one is an animal?",
  bird: "Which one is a bird?",
  vehicle: "Which one is a vehicle?",
};

const OPPOSITES = [
  ["hot", "cold"],
  ["big", "small"],
  ["up", "down"],
  ["day", "night"],
  ["happy", "sad"],
  ["fast", "slow"],
  ["tall", "short"],
  ["open", "closed"],
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

// Options are pictures, so skip any picture that could also start with the letter
function startsWithDrafts(): EnglishDraft[] {
  const letters = [...new Set(WORDS.map((item) => item.word[0]))];

  return letters.map((letter) => {
    const words = WORDS.filter((item) => item.word[0] === letter);
    const clear = words.filter((item) => !item.alt);
    const choices = clear.length > 0 ? clear : words;
    const correct = choices[randomInt(0, choices.length - 1)].emoji;
    return {
      prompt: `Which one starts with “${letter}”?`,
      correct,
      distractors: WORDS.filter(
        (item) => item.word[0] !== letter && !item.alt?.includes(letter),
      ).map((item) => item.emoji),
    };
  });
}

function firstLetterDrafts(): EnglishDraft[] {
  return WORDS.filter((item) => !item.alt).map((item) => ({
    prompt: `What letter does this start with? ${item.emoji}`,
    correct: item.word[0],
    distractors: uniqueOthers(CAPITALS, item.word[0]),
  }));
}

function bodyPartDrafts(): EnglishDraft[] {
  return BODY_PARTS.map((item) => ({
    prompt: `What is this? ${item.emoji}`,
    correct: item.word,
    distractors: uniqueOthers(
      BODY_PARTS.map((other) => other.word),
      item.word,
    ),
  }));
}

function animalSoundDrafts(): EnglishDraft[] {
  return ANIMAL_SOUNDS.map((item) => ({
    prompt: `Which animal says “${item.sound}”?`,
    correct: item.emoji,
    distractors: uniqueOthers(
      ANIMAL_SOUNDS.map((other) => other.emoji),
      item.emoji,
    ),
  }));
}

function categoryDrafts(): EnglishDraft[] {
  return (Object.keys(CATEGORY_PICTURES) as PictureCategory[]).flatMap(
    (category) =>
      CATEGORY_PICTURES[category].map((emoji) => ({
        // Same prompt per category; takeDrafts keeps only one of each
        prompt: CATEGORY_PROMPTS[category],
        correct: emoji,
        distractors: categoryDistractors(category),
      })),
  );
}

function sizeDrafts(): EnglishDraft[] {
  const smallest = SIZE_TIERS[0];
  const biggest = SIZE_TIERS[SIZE_TIERS.length - 1];
  return [
    ...biggest.map((emoji) => ({
      prompt: "Which animal is the biggest?",
      correct: emoji,
      distractors: SIZE_TIERS.slice(0, -1).flat(),
    })),
    ...smallest.map((emoji) => ({
      prompt: "Which animal is the smallest?",
      correct: emoji,
      distractors: SIZE_TIERS.slice(1).flat(),
    })),
  ];
}

function oppositeDrafts(): EnglishDraft[] {
  const words = OPPOSITES.flat();
  return OPPOSITES.flatMap(([a, b]) => [
    [a, b],
    [b, a],
  ]).map(([word, opposite]) => ({
    prompt: `What is the opposite of “${word}”?`,
    correct: opposite,
    distractors: words.filter((other) => other !== word && other !== opposite),
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
    shuffle(startsWithDrafts()).slice(0, perBucket),
    shuffle(firstLetterDrafts()).slice(0, perBucket),
    shuffle(bodyPartDrafts()).slice(0, perBucket),
    shuffle(animalSoundDrafts()).slice(0, perBucket),
    shuffle(categoryDrafts()).slice(0, perBucket),
    shuffle(sizeDrafts()).slice(0, perBucket),
    shuffle(oppositeDrafts()).slice(0, perBucket),
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
