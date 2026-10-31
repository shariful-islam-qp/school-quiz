import {
  CATEGORY_PICTURES,
  categoryDistractors,
  type PictureCategory,
  SIZE_TIERS,
} from "./picture-groups";
import type { StoredQuestion } from "./types";

type BanglaWord = {
  emoji: string;
  word: string;
  letter: string;
  genitive: string;
  /** Letters of other names a child might give the picture (🏠 → ঘর) */
  alt?: string[];
};

type BanglaDraft = {
  prompt: string;
  correct: string;
  distractors: string[];
};

const WORDS: BanglaWord[] = [
  { emoji: "🐍", word: "অজগর", letter: "অ", genitive: "অজগরের", alt: ["স"] },
  { emoji: "🥭", word: "আম", letter: "আ", genitive: "আমের" },
  { emoji: "☁️", word: "আকাশ", letter: "আ", genitive: "আকাশের", alt: ["ম"] },
  { emoji: "🍍", word: "আনারস", letter: "আ", genitive: "আনারসের" },
  { emoji: "🍎", word: "আপেল", letter: "আ", genitive: "আপেলের" },
  { emoji: "🐠", word: "ইলিশ", letter: "ই", genitive: "ইলিশের", alt: ["ম"] },
  { emoji: "🐁", word: "ইঁদুর", letter: "ই", genitive: "ইঁদুরের" },
  { emoji: "🦅", word: "ঈগল", letter: "ঈ", genitive: "ঈগলের" },
  { emoji: "🐪", word: "উট", letter: "উ", genitive: "উটের" },
  { emoji: "🍌", word: "কলা", letter: "ক", genitive: "কলার" },
  { emoji: "🖊️", word: "কলম", letter: "ক", genitive: "কলমের" },
  { emoji: "🐶", word: "কুকুর", letter: "ক", genitive: "কুকুরের" },
  { emoji: "🐈", word: "বিড়াল", letter: "ব", genitive: "বিড়ালের" },
  { emoji: "🐇", word: "খরগোশ", letter: "খ", genitive: "খরগোশের" },
  { emoji: "📒", word: "খাতা", letter: "খ", genitive: "খাতার", alt: ["ব"] },
  { emoji: "🐄", word: "গরু", letter: "গ", genitive: "গরুর" },
  { emoji: "🌹", word: "গোলাপ", letter: "গ", genitive: "গোলাপের", alt: ["ফ"] },
  { emoji: "🐴", word: "ঘোড়া", letter: "ঘ", genitive: "ঘোড়ার" },
  { emoji: "⏰", word: "ঘড়ি", letter: "ঘ", genitive: "ঘড়ির" },
  { emoji: "🌙", word: "চাঁদ", letter: "চ", genitive: "চাঁদের" },
  { emoji: "☂️", word: "ছাতা", letter: "ছ", genitive: "ছাতার" },
  { emoji: "🚢", word: "জাহাজ", letter: "জ", genitive: "জাহাজের" },
  { emoji: "🥚", word: "ডিম", letter: "ড", genitive: "ডিমের" },
  { emoji: "🌴", word: "তাল", letter: "ত", genitive: "তালের", alt: ["ন", "গ"] },
  { emoji: "⛵", word: "নৌকা", letter: "ন", genitive: "নৌকার" },
  { emoji: "🐦", word: "পাখি", letter: "প", genitive: "পাখির" },
  { emoji: "🌸", word: "ফুল", letter: "ফ", genitive: "ফুলের" },
  { emoji: "📖", word: "বই", letter: "ব", genitive: "বইয়ের", alt: ["খ"] },
  { emoji: "🏠", word: "বাড়ি", letter: "ব", genitive: "বাড়ির", alt: ["ঘ"] },
  { emoji: "⚽", word: "বল", letter: "ব", genitive: "বলের" },
  { emoji: "🐟", word: "মাছ", letter: "ম", genitive: "মাছের" },
  { emoji: "👑", word: "রাজা", letter: "র", genitive: "রাজার", alt: ["ম"] },
  { emoji: "🍋", word: "লেবু", letter: "ল", genitive: "লেবুর" },
  { emoji: "🪷", word: "শাপলা", letter: "শ", genitive: "শাপলার", alt: ["প", "ফ"] },
  { emoji: "☀️", word: "সূর্য", letter: "স", genitive: "সূর্যের" },
  { emoji: "🦁", word: "সিংহ", letter: "স", genitive: "সিংহের" },
  { emoji: "🐘", word: "হাতি", letter: "হ", genitive: "হাতির" },
  { emoji: "🐐", word: "ছাগল", letter: "ছ", genitive: "ছাগলের" },
  { emoji: "💧", word: "পানি", letter: "প", genitive: "পানির", alt: ["জ"] },
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
  { digit: "১১", word: "এগারো", count: 11 },
  { digit: "১২", word: "বারো", count: 12 },
  { digit: "১৩", word: "তেরো", count: 13 },
  { digit: "১৪", word: "চৌদ্দ", count: 14 },
  { digit: "১৫", word: "পনেরো", count: 15 },
  { digit: "১৬", word: "ষোলো", count: 16 },
  { digit: "১৭", word: "সতেরো", count: 17 },
  { digit: "১৮", word: "আঠারো", count: 18 },
  { digit: "১৯", word: "উনিশ", count: 19 },
  { digit: "২০", word: "বিশ", count: 20 },
];

const ANIMAL_SOUNDS = [
  { emoji: "🐄", sound: "হাম্বা" },
  { emoji: "🐶", sound: "ঘেউ ঘেউ" },
  { emoji: "🐈", sound: "মিউ মিউ" },
  { emoji: "🐐", sound: "ম্যা ম্যা" },
  { emoji: "🦆", sound: "প্যাঁক প্যাঁক" },
  { emoji: "🐓", sound: "কুকুরু কু" },
  { emoji: "🦊", sound: "হুক্কা হুয়া" },
];

const CATEGORY_PROMPTS: Record<PictureCategory, string> = {
  fruit: "কোনটি ফল?",
  animal: "কোনটি প্রাণী?",
  bird: "কোনটি পাখি?",
  vehicle: "কোনটি যানবাহন?",
};

const OPPOSITES = [
  ["গরম", "ঠান্ডা"],
  ["বড়", "ছোট"],
  ["উপর", "নিচ"],
  ["দিন", "রাত"],
  ["হাসি", "কান্না"],
  ["আলো", "অন্ধকার"],
  ["ভালো", "মন্দ"],
];

type FixedQuestion = { prompt: string; correct: string; distractors: string[] };

const GIVES_US: FixedQuestion[] = [
  { prompt: "গরু আমাদের কী দেয়?", correct: "🥛 দুধ", distractors: ["🍯 মধু", "🥚 ডিম", "🧶 পশম"] },
  { prompt: "মুরগি আমাদের কী দেয়?", correct: "🥚 ডিম", distractors: ["🥛 দুধ", "🍯 মধু", "🧶 পশম"] },
  { prompt: "মৌমাছি আমাদের কী দেয়?", correct: "🍯 মধু", distractors: ["🥛 দুধ", "🥚 ডিম", "🧶 পশম"] },
  { prompt: "দিনের আকাশে কী দেখা যায়?", correct: "☀️ সূর্য", distractors: ["🌙 চাঁদ"] },
  { prompt: "রাতের আকাশে কী দেখা যায়?", correct: "🌙 চাঁদ", distractors: ["☀️ সূর্য"] },
];

const GENERAL_KNOWLEDGE: FixedQuestion[] = [
  { prompt: "বাংলাদেশের জাতীয় ফুল কী?", correct: "🪷 শাপলা", distractors: ["🌹 গোলাপ", "🌻 সূর্যমুখী", "🌼 গাঁদা"] },
  { prompt: "বাংলাদেশের জাতীয় ফল কী?", correct: "কাঁঠাল", distractors: ["আম", "কলা", "লিচু"] },
  { prompt: "বাংলাদেশের জাতীয় পাখি কী?", correct: "দোয়েল", distractors: ["কাক", "টিয়া", "ময়না"] },
  { prompt: "বাংলাদেশের জাতীয় মাছ কী?", correct: "ইলিশ", distractors: ["রুই", "কাতলা", "পুঁটি"] },
  { prompt: "বাংলাদেশের জাতীয় পশু কী?", correct: "🐅 রয়েল বেঙ্গল টাইগার", distractors: ["🦁 সিংহ", "🐘 হাতি", "🐄 গরু"] },
  { prompt: "বাংলাদেশের রাজধানীর নাম কী?", correct: "ঢাকা", distractors: ["চট্টগ্রাম", "খুলনা", "সিলেট"] },
  { prompt: "কোন প্রাণী আমাদের দুধ দেয়?", correct: "🐄", distractors: ["🐅", "🦁", "🐍"] },
  { prompt: "স্বরবর্ণ কয়টি?", correct: "১১", distractors: ["৫", "২৬", "৩৯"] },
  { prompt: "ব্যঞ্জনবর্ণ কয়টি?", correct: "৩৯", distractors: ["১১", "২৬", "৫০"] },
  { prompt: "সপ্তাহে কয় দিন?", correct: "৭", distractors: ["৫", "৬", "১০"] },
];

const TRUE_FALSE: { statement: string; isTrue: boolean }[] = [
  { statement: "সূর্য পূর্ব দিকে ওঠে।", isTrue: true },
  { statement: "গরু আমাদের দুধ দেয়।", isTrue: true },
  { statement: "মাছ পানি ছাড়া বাঁচতে পারে।", isTrue: false },
  { statement: "সপ্তাহে ৭ দিন।", isTrue: true },
  { statement: "বাংলাদেশ আমাদের দেশ।", isTrue: true },
  { statement: "বিড়াল উড়তে পারে।", isTrue: false },
  { statement: "রাতে আকাশে সূর্য দেখা যায়।", isTrue: false },
  { statement: "বরফ ঠান্ডা।", isTrue: true },
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
  const byLetter = new Map<string, BanglaWord[]>();
  for (const item of WORDS) {
    const words = byLetter.get(item.letter) ?? [];
    words.push(item);
    byLetter.set(item.letter, words);
  }

  // Options are pictures, so skip any picture that could also start with the letter
  return [...byLetter.entries()].map(([letter, words]) => {
    const clear = words.filter((item) => !item.alt);
    const choices = clear.length > 0 ? clear : words;
    const correct = choices[randomInt(0, choices.length - 1)].emoji;
    return {
      prompt: `কোনটির নাম ${letter} দিয়ে শুরু?`,
      correct,
      distractors: uniqueOthers(
        WORDS.filter(
          (item) => item.letter !== letter && !item.alt?.includes(letter),
        ).map((item) => item.emoji),
        correct,
      ),
    };
  });
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

function numberOrderDrafts(): BanglaDraft[] {
  const digits = NUMBERS.map((item) => item.digit);
  const drafts: BanglaDraft[] = [];

  for (let index = 0; index < digits.length; index += 1) {
    const digit = digits[index];
    if (index + 3 < digits.length) {
      drafts.push({
        prompt: `${digits.slice(index, index + 3).join(", ")}, ?`,
        correct: digits[index + 3],
        distractors: uniqueOthers(digits, digits[index + 3]),
      });
    }
    if (index + 1 < digits.length) {
      drafts.push({
        prompt: `${digit} এর পরে কোন সংখ্যা?`,
        correct: digits[index + 1],
        distractors: uniqueOthers(digits, digits[index + 1]),
      });
    }
    if (index > 0) {
      drafts.push({
        prompt: `${digit} এর আগে কোন সংখ্যা?`,
        correct: digits[index - 1],
        distractors: uniqueOthers(digits, digits[index - 1]),
      });
    }
  }

  return drafts;
}

function biggestNumberDrafts(): BanglaDraft[] {
  return Array.from({ length: 8 }, () => {
    const picked = shuffle(NUMBERS)
      .slice(0, 4)
      .sort((x, y) => x.count - y.count)
      .map((item) => item.digit);
    const biggest = Math.random() < 0.5;
    const correct = biggest ? picked[3] : picked[0];
    return {
      prompt: `কোন সংখ্যাটি সবচেয়ে ${biggest ? "বড়" : "ছোট"}?`,
      correct,
      distractors: picked.filter((digit) => digit !== correct),
    };
  });
}

// Bangla letters (vowels and consonants), as opposed to vowel signs and marks
const BANGLA_LETTER = /[অ-হড়-য়]/;

function missingFirstLetterDrafts(): BanglaDraft[] {
  const letters = [...new Set(WORDS.map((item) => item.letter))];

  // Only words whose first letter stands alone: "কলা" → "_লা", not "ঘোড়া"
  return WORDS.filter(
    (item) =>
      !item.alt &&
      item.word.startsWith(item.letter) &&
      BANGLA_LETTER.test(item.word.charAt(item.letter.length)),
  ).map((item) => ({
    prompt: `${item.emoji} _${item.word.slice(item.letter.length)} — কোন অক্ষর বসবে?`,
    correct: item.letter,
    distractors: letters.filter((letter) => letter !== item.letter),
  }));
}

function animalSoundDrafts(): BanglaDraft[] {
  return ANIMAL_SOUNDS.map((item) => ({
    prompt: `কোন প্রাণী "${item.sound}" ডাকে?`,
    correct: item.emoji,
    distractors: uniqueOthers(
      ANIMAL_SOUNDS.map((other) => other.emoji),
      item.emoji,
    ),
  }));
}

function categoryDrafts(): BanglaDraft[] {
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

function sizeDrafts(): BanglaDraft[] {
  const smallest = SIZE_TIERS[0];
  const biggest = SIZE_TIERS[SIZE_TIERS.length - 1];
  return [
    ...biggest.map((emoji) => ({
      prompt: "কোনটি সবচেয়ে বড়?",
      correct: emoji,
      distractors: SIZE_TIERS.slice(0, -1).flat(),
    })),
    ...smallest.map((emoji) => ({
      prompt: "কোনটি সবচেয়ে ছোট?",
      correct: emoji,
      distractors: SIZE_TIERS.slice(1).flat(),
    })),
  ];
}

function oppositeDrafts(): BanglaDraft[] {
  const words = OPPOSITES.flat();
  return OPPOSITES.flatMap(([a, b]) => [
    [a, b],
    [b, a],
  ]).map(([word, opposite]) => ({
    prompt: `"${word}" এর বিপরীত শব্দ কী?`,
    correct: opposite,
    distractors: words.filter((other) => other !== word && other !== opposite),
  }));
}

// Words that end in a whole letter: "আম" → "আ" + "ম", not "কলা" (ends in a vowel sign)
const LAST_LETTER_WORDS = WORDS.filter(
  (item) =>
    !item.alt && item.word.length >= 2 && BANGLA_LETTER.test(item.word.slice(-1)),
);

function missingLastLetterDrafts(): BanglaDraft[] {
  return LAST_LETTER_WORDS.map((item) => {
    const last = item.word.slice(-1);
    return {
      prompt: `${item.emoji} ${item.word.slice(0, -1)}_ — কোন অক্ষর বসবে?`,
      correct: last,
      distractors: uniqueOthers(CONSONANTS, last),
    };
  });
}

function joinLettersDrafts(): BanglaDraft[] {
  return LAST_LETTER_WORDS.map((item) => ({
    prompt: `${item.word.slice(0, -1)} + ${item.word.slice(-1)} = ?`,
    correct: item.word,
    distractors: uniqueOthers(
      LAST_LETTER_WORDS.map((other) => other.word),
      item.word,
    ),
  }));
}

function fixedDrafts(questions: FixedQuestion[]): BanglaDraft[] {
  return questions.map((item) => ({ ...item }));
}

function trueFalseDrafts(): BanglaDraft[] {
  return TRUE_FALSE.map((item) => ({
    prompt: `${item.statement} সত্য না মিথ্যা?`,
    correct: item.isTrue ? "সত্য" : "মিথ্যা",
    distractors: [item.isTrue ? "মিথ্যা" : "সত্য"],
  }));
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
    shuffle(numberOrderDrafts()).slice(0, perBucket),
    shuffle(biggestNumberDrafts()).slice(0, perBucket),
    shuffle(missingFirstLetterDrafts()).slice(0, perBucket),
    shuffle(animalSoundDrafts()).slice(0, perBucket),
    shuffle(categoryDrafts()).slice(0, perBucket),
    shuffle(sizeDrafts()).slice(0, perBucket),
    shuffle(oppositeDrafts()).slice(0, perBucket),
    shuffle(missingLastLetterDrafts()).slice(0, perBucket),
    shuffle(joinLettersDrafts()).slice(0, perBucket),
    shuffle(fixedDrafts(GIVES_US)).slice(0, perBucket),
    shuffle(fixedDrafts(GENERAL_KNOWLEDGE)).slice(0, perBucket),
    shuffle(trueFalseDrafts()).slice(0, perBucket),
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
