export interface DeckMetadata {
  csvFile?: string; // Path to CSV file, e.g., "/flashcards.csv"
  name?: string;
  description?: string;
  category?: string;
  colour?: string;
  tags?: string[];
  maxStreak?: number;
}

export interface Deck {
  name: string;
  filename: string;
  description?: string;
  category?: string;
  colour?: string;
  tags?: string[];
  cardCount?: number;
  lastStudied?: number | null;
  averageAccuracy?: number;
  maxStreak?: number;
  needsSetup?: boolean; // True if CSV exists but no metadata in decks.json
  cardsStudied?: number; // Number of cards that have been studied at least once
  cardsMastered?: number; // Number of cards with accuracy >= 0.8
  cardsNeedingReview?: number; // Number of cards with low accuracy or not studied recently
  newCards?: number; // Number of cards never studied
}

export async function listDecks(): Promise<Deck[]> {
  try {
    // In a real app, you'd fetch from an API that lists files
    // For now, we'll use a hardcoded list or fetch from a manifest
    // Since we can't list files from the client, we'll need an API route
    const response = await fetch('/api/decks');
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to list decks:', error);
    return [];
  }
}

export async function loadDeck(filename: string): Promise<string> {
  const response = await fetch(`/public/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load deck: ${filename}`);
  }
  return await response.text();
}

