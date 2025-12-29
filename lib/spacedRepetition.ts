import type { Flashcard } from './csvParser';
import { getSettings, getDeckSettings } from './storage';

export interface CardWithScore {
  card: Flashcard;
  score: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getDaysSince(timestamp: number | null): number {
  if (!timestamp) return Infinity;
  return (Date.now() - timestamp) / MS_PER_DAY;
}

function calculateCardScore(
  card: Flashcard,
  settings: ReturnType<typeof getSettings>
): number {
  const daysSinceAsked = getDaysSince(card.lastAsked);
  const isForgotten = daysSinceAsked >= settings.forgottenCardThreshold;
  const accuracy = card.accuracy;

  // Base score
  let score = 1;

  // Boost for low accuracy (wrong cards)
  if (accuracy < 0.5) {
    // Lower accuracy = higher score (show more often)
    score *= settings.wrongCardMultiplier * (2 - accuracy * 2);
  }

  // Reduce for high accuracy (correct cards)
  if (accuracy > 0.5) {
    // Higher accuracy = lower score (show less often)
    score /= settings.correctCardDivisor * (accuracy * 2);
    // Further reduce if recently answered correctly
    if (card.lastAsked && getDaysSince(card.lastAsked) < 1) {
      score /= 2;
    }
  }

  // Boost for forgotten cards (occasionally)
  if (isForgotten && Math.random() < settings.forgottenCardChance) {
    score *= 2;
  }

  // Boost for never-asked cards
  if (!card.lastAsked) {
    score *= 1.5;
  }

  return score;
}

export function selectNextCard(cards: Flashcard[], deckFilename?: string): Flashcard | null {
  if (cards.length === 0) return null;

  const settings = deckFilename ? getDeckSettings(deckFilename) : getSettings();
  const cardsWithScores: CardWithScore[] = cards.map((card) => {
    const score = calculateCardScore(card, settings);
    return { card, score };
  });

  // Weighted random selection based on scores
  const totalScore = cardsWithScores.reduce((sum, item) => sum + item.score, 0);
  if (totalScore === 0) {
    // Fallback to random selection
    return cards[Math.floor(Math.random() * cards.length)];
  }

  let random = Math.random() * totalScore;
  for (const item of cardsWithScores) {
    random -= item.score;
    if (random <= 0) {
      return item.card;
    }
  }

  // Fallback
  return cardsWithScores[0].card;
}

