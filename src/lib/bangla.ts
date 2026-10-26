import type { StoredQuestion } from "./types";

type BanglaWord = {
  emoji: string;
  word: string;
  letter: string;
  genitive: string;
};

type BanglaDraft = {
  prompt: string;
  correct: string;
  distractors: string[];
};

const WORDS: BanglaWord[] = [
  { emoji: "🐍", word: "অজগর", letter: "অ", genitive: "অজগরের" },
  { emoji: "🍎", word: "আম", letter: "আ", genitive: "আমের" },
  { emoji: "☁️", word: "আকাশ", letter: "আ", genitive: "আকাশের" },
  { emoji: "🍍", word: "আনারস", letter: "আ", genitive: "আনারসের" },
  { emoji: "🐠", word: "ইলিশ", letter: "ই", genitive: "ইলিশের" },
  { emoji: "🐁", word: "ইঁদুর", letter: "ই", genitive: "ইঁদুরের" },
  { emoji: "🦅", word: "ঈগল", letter: "ঈ", genitive: "ঈগলের" },
  { emoji: "🐪", word: "উট", letter: "উ", genitive: "উটের" },
  { emoji: "🍌", word: "কলা", letter: "ক", genitive: "কলার" },
  { emoji: "✏️", word: "কলম", letter: "ক", genitive: "কলমের" },
  { emoji: "🐶", word: "কুকুর", letter: "ক", genitive: "কুকুরের" },
  { emoji: "🐈", word: "বিড়াল", letter: "ব", genitive: "বিড়ালের" },
  { emoji: "🐇", word: "খরগোশ", letter: "খ", genitive: "খরগোশের" },
  { emoji: "📒", word: "খাতা", letter: "খ", genitive: "খাতার" },
  { emoji: "🐄", word: "গরু", letter: "গ", genitive: "গরুর" },
  { emoji: "🌹", word: "গোলাপ", letter: "গ", genitive: "গোলাপের" },
  { emoji: "🐴", word: "ঘোড়া", letter: "ঘ", genitive: "ঘোড়ার" },
  { emoji: "⏰", word: "ঘড়ি", letter: "ঘ", genitive: "ঘড়ির" },
  { emoji: "🌙", word: "চাঁদ", letter: "চ", genitive: "চাঁদের" },
  { emoji: "☂️", word: "ছাতা", letter: "ছ", genitive: "ছাতার" },
  { emoji: "🚢", word: "জাহাজ", letter: "জ", genitive: "জাহাজের" },
  { emoji: "🥚", word: "ডিম", letter: "ড", genitive: "ডিমের" },
  { emoji: "🌴", word: "তাল", letter: "ত", genitive: "তালের" },
  { emoji: "⛵", word: "নৌকা", letter: "ন", genitive: "নৌকার" },
  { emoji: "🐦", word: "পাখি", letter: "প", genitive: "পাখির" },
  { emoji: "🌸", word: "ফুল", letter: "ফ", genitive: "ফুলের" },
  { emoji: "📖", word: "বই", letter: "ব", genitive: "বইয়ের" },
  { emoji: "🏠", word: "বাড়ি", letter: "ব", genitive: "বাড়ির" },
  { emoji: "⚽", word: "বল", letter: "ব", genitive: "বলের" },
  { emoji: "🐟", word: "মাছ", letter: "ম", genitive: "মাছের" },
  { emoji: "🥭", word: "আমড়া", letter: "আ", genitive: "আমড়ার" },
  { emoji: "👑", word: "রাজা", letter: "র", genitive: "রাজার" },
  { emoji: "🍋", word: "লেবু", letter: "ল", genitive: "লেবুর" },
  { emoji: "🪷", word: "শাপলা", letter: "শ", genitive: "শাপলার" },
  { emoji: "☀️", word: "সূর্য", letter: "স", genitive: "সূর্যের" },
  { emoji: "🦁", word: "সিংহ", letter: "স", genitive: "সিংহের" },
  { emoji: "🐘", word: "হাতি", letter: "হ", genitive: "হাতির" },
  { emoji: "🐐", word: "ছাগল", letter: "ছ", genitive: "ছাগলের" },
  { emoji: "💧", word: "পানি", letter: "প", genitive: "পানির" },
  { emoji: "🥛", word: "দুধ", letter: "দ", genitive: "দুধের" },
];

const VOWELS = ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ"];

const CONSONANTS = [
  "ক",
  "খ",
  "গ",
  "ঘ",
  "ঙ",
  "চ",
  "ছ",
  "জ",
  "ঝ",
  "ঞ",
  "ট",
  "ঠ",
  "ড",
  "ঢ",
  "ণ",
  "ত",
  "থ",
  "দ",
  "ধ",
  "ন",
  "প",
  "ফ",
  "ব",
  "ভ",
  "ম",
  "য",
  "র",
  "ল",
  "শ",
  "ষ",
  "স",
  "হ",
];

const NUMBERS = [
  { digit: "১", word: "এক", count: 1 },
  { digit: "২", word: "দুই", count: 2 },
  { digit: "৩", word: "তিন", count: 3 },
  { digit: "৪", word: "চার", count: 4 },
  { digit: "৫", word: "পাঁচ", count: 5 },
  { digit: "৬", word: "ছয়", count: 6 },
  { digit: "৭", word: "সাত", count: 7 },
  { digit: "৮", word: "আট", count: 8 },
  { digit: "৯", word: "নয়", count: 9 },
  { digit: "১০", word: "দশ", count: 10 },
];

const COLORS = [
  { emoji: "🔴", name: "লাল" },
  { emoji: "🟢", name: "সবুজ" },
  { emoji: "🔵", name: "নীল" },
  { emoji: "🟡", name: "হলুদ" },
  { emoji: "⚪", name: "সাদা" },
  { emoji: "⚫", name: "কালো" },
];

const FAMILY = [
  { emoji: "👩", word: "মা" },
  { emoji: "👨", word: "বাবা" },
  { emoji: "👧", word: "বোন" },
  { emoji: "👦", word: "ভাই" },
];

const BODY_PARTS = [
  { emoji: "👁️", word: "চোখ" },
  { emoji: "👂", word: "কান" },
  { emoji: "👃", word: "নাক" },
  { emoji: "👄", word: "মুখ" },
  { emoji: "✋", word: "হাত" },
  { emoji: "🦶", word: "পা" },
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

function formatLetters(letters: string[]): string {
  return letters.join(", ");
}

function uniqueOthers(pool: string[], correct: string): string[] {
  return [...new Set(pool.filter((item) => item !== correct))];
}

function nextLetterDrafts(
  alphabet: string[],
  prefixLength: number,
): BanglaDraft[] {
  const drafts: BanglaDraft[] = [];

  for (let index = 0; index <= alphabet.length - prefixLength - 1; index += 1) {
    const shown = alphabet.slice(index, index + prefixLength);
    const correct = alphabet[index + prefixLength];
    drafts.push({
      prompt: `${formatLetters(shown)} এর পরে কোন অক্ষর?`,
      correct,
      distractors: uniqueOthers(alphabet, correct),
    });
  }

  return drafts;
}

function pictureDrafts(): BanglaDraft[] {
  return WORDS.map((item) => ({
    prompt: `এটা কী? ${item.emoji}`,
    correct: item.word,
    distractors: uniqueOthers(
      WORDS.map((other) => other.word),
      item.word,
    ),
  }));
}

function wordFromLetterDrafts(): BanglaDraft[] {
  const byLetter = new Map<string, string[]>();
  for (const item of WORDS) {
    const words = byLetter.get(item.letter) ?? [];
    words.push(item.word);
    byLetter.set(item.letter, words);
  }

  return [...byLetter.entries()].map(([letter, words]) => ({
    prompt: `${letter} দিয়ে একটি শব্দ বলো।`,
    correct: words[0],
    distractors: uniqueOthers(
      WORDS.filter((item) => item.letter !== letter).map((item) => item.word),
      words[0],
    ),
  }));
}

function firstLetterDrafts(): BanglaDraft[] {
  const letters = [...new Set(WORDS.map((item) => item.letter))];

  return WORDS.map((item) => ({
    prompt: `${item.genitive} প্রথম অক্ষর কী?`,
    correct: item.letter,
    distractors: letters.filter((letter) => letter !== item.letter),
  }));
}

function vowelOrConsonantDrafts(): BanglaDraft[] {
  const samples = shuffle([
    ...VOWELS.map((letter) => ({ letter, kind: "স্বরবর্ণ" as const })),
    ...CONSONANTS.slice(0, 16).map((letter) => ({
      letter,
      kind: "ব্যঞ্জনবর্ণ" as const,
    })),
  ]).slice(0, 12);

  return samples.map(({ letter, kind }) => ({
    prompt: `"${letter}" কোন ধরনের অক্ষর?`,
    correct: kind,
    distractors: uniqueOthers(["স্বরবর্ণ", "ব্যঞ্জনবর্ণ", "সংখ্যা", "রঙ"], kind),
  }));
}

function numberWordDrafts(): BanglaDraft[] {
  return NUMBERS.map((item) => ({
    prompt: `${item.digit} কে অক্ষরে লেখো।`,
    correct: item.word,
    distractors: uniqueOthers(
      NUMBERS.map((other) => other.word),
      item.word,
    ),
  }));
}

function numberDigitDrafts(): BanglaDraft[] {
  return NUMBERS.map((item) => ({
    prompt: `"${item.word}" সংখ্যা কোনটি?`,
    correct: item.digit,
    distractors: uniqueOthers(
      NUMBERS.map((other) => other.digit),
      item.digit,
    ),
  }));
}

function countObjectDrafts(): BanglaDraft[] {
  return NUMBERS.slice(1, 6).map((item) => {
    const emoji = item.count % 2 === 0 ? "⭐" : "🍎";
    return {
      prompt: `কয়টি আছে? ${emoji.repeat(item.count)}`,
      correct: item.digit,
      distractors: uniqueOthers(
        NUMBERS.map((other) => other.digit),
        item.digit,
      ),
    };
  });
}

function colorDrafts(): BanglaDraft[] {
  return COLORS.map((item) => ({
    prompt: `এটা কোন রঙ? ${item.emoji}`,
    correct: item.name,
    distractors: uniqueOthers(
      COLORS.map((other) => other.name),
      item.name,
    ),
  }));
}

function familyDrafts(): BanglaDraft[] {
  return FAMILY.map((item) => ({
    prompt: `এটা কে? ${item.emoji}`,
    correct: item.word,
    distractors: uniqueOthers(
      FAMILY.map((other) => other.word),
      item.word,
    ),
  }));
}

function bodyPartDrafts(): BanglaDraft[] {
  return BODY_PARTS.map((item) => ({
    prompt: `এটা কী? ${item.emoji}`,
    correct: item.word,
    distractors: uniqueOthers(
      BODY_PARTS.map((other) => other.word),
      item.word,
    ),
  }));
}

function missingLetterDrafts(alphabet: string[]): BanglaDraft[] {
  const drafts: BanglaDraft[] = [];

  for (let index = 1; index < alphabet.length - 1; index += 1) {
    const before = alphabet[index - 1];
    const correct = alphabet[index];
    const after = alphabet[index + 1];
    drafts.push({
      prompt: `${before}, ?, ${after} — মাঝের অক্ষর কোনটি?`,
      correct,
      distractors: uniqueOthers(alphabet, correct),
    });
  }

  return drafts;
}

function takeDrafts(count: number): BanglaDraft[] {
  // Build only a small sample per type so serverless memory stays low
  const perBucket = Math.max(2, Math.ceil(count / 4));
  const buckets = shuffle([
    shuffle(nextLetterDrafts(VOWELS, 3)).slice(0, perBucket),
    shuffle(nextLetterDrafts(CONSONANTS, 3)).slice(0, perBucket),
    shuffle(nextLetterDrafts(VOWELS, 2)).slice(0, perBucket),
    shuffle(nextLetterDrafts(CONSONANTS, 2)).slice(0, perBucket),
    shuffle(pictureDrafts()).slice(0, perBucket),
    shuffle(wordFromLetterDrafts()).slice(0, perBucket),
    shuffle(firstLetterDrafts()).slice(0, perBucket),
    shuffle(vowelOrConsonantDrafts()).slice(0, perBucket),
    shuffle(numberWordDrafts()).slice(0, perBucket),
    shuffle(numberDigitDrafts()).slice(0, perBucket),
    shuffle(countObjectDrafts()).slice(0, perBucket),
    shuffle(colorDrafts()).slice(0, perBucket),
    shuffle(familyDrafts()).slice(0, perBucket),
    shuffle(bodyPartDrafts()).slice(0, perBucket),
    shuffle(missingLetterDrafts(VOWELS)).slice(0, perBucket),
    shuffle(missingLetterDrafts(CONSONANTS)).slice(0, perBucket),
  ]);

  const picked: BanglaDraft[] = [];
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

function toQuestion(draft: BanglaDraft, index: number): StoredQuestion {
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

export function generateBanglaQuestions(count: number): StoredQuestion[] {
  return takeDrafts(count).map(toQuestion);
}
