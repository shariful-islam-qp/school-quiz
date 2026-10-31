/**
 * Sound effects (synthesised, so no audio files to ship) and read-aloud via
 * the browser's built-in speech. Browser only.
 */

export type SoundName = "correct" | "wrong" | "finish";

// [frequency Hz, start s, duration s]
const NOTES: Record<SoundName, [number, number, number][]> = {
  correct: [
    [523.25, 0, 0.12],
    [659.25, 0.1, 0.12],
    [783.99, 0.2, 0.25],
  ],
  // Soft and low rather than a harsh buzzer
  wrong: [
    [329.63, 0, 0.18],
    [261.63, 0.16, 0.3],
  ],
  finish: [
    [523.25, 0, 0.12],
    [659.25, 0.12, 0.12],
    [783.99, 0.24, 0.12],
    [1046.5, 0.36, 0.45],
  ],
};

const MUTE_KEY = "quiz-sound-muted";

let context: AudioContext | null = null;

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Storage blocked (private mode); the toggle still works for this visit
  }
}

export function playSound(name: SoundName): void {
  if (isMuted()) {
    return;
  }

  try {
    context ??= new AudioContext();
    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    for (const [frequency, start, duration] of NOTES[name]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = name === "wrong" ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + duration + 0.05);
    }
  } catch {
    // Web Audio unavailable; sounds are a nice-to-have
  }
}

const BANGLA = /[ঀ-৿]/;
const EMOJI = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu;

function speechLang(text: string): "bn" | "en" {
  return BANGLA.test(text) ? "bn" : "en";
}

function findVoice(lang: "bn" | "en"): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith(lang));
}

/** Subscribe to voice list changes (voices load asynchronously). */
export function subscribeVoices(onChange: () => void): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return () => {};
  }
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () =>
    window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

/** Text to read, or "" when only pictures are left (e.g. "🍬🍬 − 🍬 = ?"). */
function toSpoken(text: string, lang: "bn" | "en"): string {
  const withoutEmoji = text.replace(EMOJI, " ");
  if (!/[\p{L}\d]/u.test(withoutEmoji)) {
    return "";
  }
  return (
    withoutEmoji
      // A lone "?" is a blank to fill in: "3 + ? = 7" → "3 plus what equals 7"
      .replace(/(^|\s)\?(?=\s|$)/g, lang === "bn" ? "$1কত" : "$1what")
      .replace(/−/g, " minus ")
      .trim()
  );
}

/** Whether this device has a voice that can read the text's language. */
export function canSpeak(text: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  const lang = speechLang(text);
  return toSpoken(text, lang) !== "" && findVoice(lang) !== undefined;
}

export function speak(text: string): void {
  if (!canSpeak(text)) {
    return;
  }

  const lang = speechLang(text);
  const utterance = new SpeechSynthesisUtterance(toSpoken(text, lang));
  const voice = findVoice(lang);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  utterance.rate = 0.85;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
