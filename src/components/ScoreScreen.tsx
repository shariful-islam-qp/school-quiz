"use client";

import type { QuizChoice, ScoreResult } from "@/lib/types";
import { swatchFor } from "@/lib/colors";
import { ColorChip, PromptText } from "./PromptText";

function AnswerText({ value }: { value: QuizChoice | null }) {
  if (value === null) {
    return "—";
  }
  const swatch = swatchFor(value);
  return (
    <>
      {swatch ? <ColorChip color={swatch} /> : null}
      {value}
    </>
  );
}

function answerLang(value: QuizChoice | null): "bn" | undefined {
  return typeof value === "string" && /[\u0980-\u09FF]/.test(value)
    ? "bn"
    : undefined;
}

type ScoreScreenProps = {
  result: ScoreResult;
  onPlayAgain: () => void;
};

export function ScoreScreen({ result, onPlayAgain }: ScoreScreenProps) {
  const percent = Math.round((result.score / result.total) * 100);

  return (
    <section className="score-screen panel pop-in">
      <header className="score-hero">
        <div className="score-burst" aria-hidden>
          {percent}%
        </div>
        <p className="eyebrow">Results</p>
        <h1>
          {result.score} / {result.total}
        </h1>
        <p className="lede">You scored {percent}%.</p>
      </header>

      <ul className="result-list">
        {result.results.map((item, index) => (
          <li
            key={item.questionId}
            className={item.isCorrect ? "correct" : "incorrect"}
          >
            <div className="result-top">
              <strong lang={/[\u0980-\u09FF]/.test(item.prompt) ? "bn" : undefined}>
                Q{index + 1}. <PromptText text={item.prompt} />
              </strong>
              <span className="result-badge">
                {item.isCorrect
                  ? "Correct"
                  : item.timedOut
                    ? "Timed out"
                    : "Wrong"}
              </span>
            </div>
            <p>
              Your answer:{" "}
              <span
                lang={answerLang(
                  item.selectedIndex === null
                    ? null
                    : item.options[item.selectedIndex],
                )}
                className={item.isCorrect ? "answer-correct" : "answer-wrong"}
              >
                <AnswerText
                  value={
                    item.selectedIndex === null
                      ? null
                      : item.options[item.selectedIndex]
                  }
                />
              </span>
              {!item.isCorrect ? (
                <>
                  {" "}
                  · Correct:{" "}
                  <span
                    lang={answerLang(item.correctAnswer)}
                    className="answer-correct"
                  >
                    <AnswerText value={item.correctAnswer} />
                  </span>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>

      <button type="button" className="primary-btn" onClick={onPlayAgain}>
        Play again
      </button>
    </section>
  );
}
