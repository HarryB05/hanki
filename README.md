# Hanki - Flashcard App

![Hanki Screenshot](./public/screenshots/ss1.png)

A spaced repetition flashcard application built with Next.js. Study your flashcards with an intelligent algorithm that shows you difficult cards more often and easy cards less often.

## Features

- **Multiple Decks**: Each CSV file is its own deck that you can select to study
- **Spaced Repetition**: Automatically prioritises cards based on your performance
- **Configurable Settings**: Adjust how often you see correct vs incorrect cards
- **Forgotten Card Reminders**: Occasionally shows cards you haven't seen in a while
- **Progress Tracking**: Progress is saved directly in the CSV files (accuracy score and last asked timestamp)
- **CSV Import**: Simply add your flashcards as CSV files in the public folder

## Getting Started

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Place your flashcard CSV files in the `public` folder (e.g., `algorithms.csv`, `vocabulary.csv`)

The CSV should have the format:
```csv
Question,Answer
What is the capital of France?,Paris
What is 2+2?,4
```

When you start studying, the app will automatically add `Accuracy` and `LastAsked` columns to track your progress:
```csv
Question,Answer,Accuracy,LastAsked
What is the capital of France?,"Paris",0.8500,1704067200000
What is 2+2?,"4",1.0000,1704067300000
```

3. (Optional) Add deck metadata in `public/decks.json` to customise how decks appear:

```json
{
  "algorithms": {
    "name": "Algorithms & Data Structures",
    "description": "Fundamental algorithms, sorting, searching, and data structures concepts",
    "category": "Computer Science",
    "colour": "blue",
    "tags": ["algorithms", "data-structures", "sorting"]
  },
  "vocabulary": {
    "name": "Spanish Vocabulary",
    "description": "Common Spanish words and phrases",
    "category": "Language",
    "colour": "green",
    "tags": ["spanish", "vocabulary"]
  }
}
```

Available colours: `blue`, `green`, `purple`, `red`, `yellow`, `indigo`, `pink`

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select a Deck**: Choose which CSV deck you want to study from the deck selector
2. **Study Flashcards**: Click "Show Answer" to reveal the answer, then mark it as Correct or Incorrect
3. **Progress is Saved**: Your accuracy score (0-1) and last asked timestamp are automatically saved back to the CSV file
4. **Adjust Settings**: Click the Settings button to customise:
   - **Wrong Card Multiplier**: How much more often to show cards you get wrong (default: 3x)
   - **Correct Card Divisor**: How much less often to show cards you get right (default: 2x)
   - **Forgotten Card Threshold**: Days since last asked to be considered "forgotten" (default: 7 days)
   - **Forgotten Card Chance**: Probability of showing a forgotten card (default: 20%)

## How It Works

The app uses a weighted random selection algorithm based on:
- **Accuracy Score**: Cards with lower accuracy (0-1) are shown more frequently
- **Time since last asked**: Cards you haven't seen in a while get occasional priority
- **Never-asked cards**: New cards get a slight boost to ensure they're seen

Progress is stored directly in the CSV files:
- **Accuracy**: A score between 0 and 1 representing how often you get the card correct
- **LastAsked**: Unix timestamp (milliseconds) of when the card was last asked

This means your progress is portable - you can share CSV files with others and they'll include your study history.



