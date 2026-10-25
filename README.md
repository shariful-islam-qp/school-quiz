# School Quiz

Timed multiple-choice school quizzes. **Math** is available now; English and Bangla are placeholders.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** for styling
- API routes for quiz generation and scoring (correct answers stay server-side)

## Features

- Subject: Math / English / Bangla (default **Math**)
- Math: configurable max number, addition/subtraction, question count (default **5**)
- 4 answer choices each
- Per-question timer (default **60s**); timeout counts as wrong
- Instant colored result after each answer, then final score review

## Run locally

```bash
cd quiz
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

### `POST /api/quiz`

Create a quiz session.

```json
{
  "subject": "math",
  "maxNumber": 10,
  "operations": ["addition", "subtraction"],
  "timeLimitSeconds": 60,
  "questionCount": 5
}
```

Returns `quizId`, `timeLimitSeconds`, and public `questions` (no correct answers).  
`english` / `bangla` return an error until questions are added.

### `POST /api/quiz/check`

Check one answer and get immediate feedback.

```json
{
  "quizId": "...",
  "questionId": "...",
  "selectedIndex": 2
}
```

### `POST /api/quiz/submit`

Score a finished quiz.

```json
{
  "quizId": "...",
  "answers": [
    { "questionId": "...", "selectedIndex": 2 },
    { "questionId": "...", "selectedIndex": null }
  ]
}
```

`selectedIndex: null` means timed out / unanswered.
