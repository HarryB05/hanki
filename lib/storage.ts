export interface CardProgress {
  correctCount: number;
  incorrectCount: number;
  lastAsked: number | null;
  lastCorrect: number | null;
}

export interface AppSettings {
  wrongCardMultiplier: number; // How much more often to show wrong cards
  correctCardDivisor: number; // How much less often to show correct cards
  forgottenCardThreshold: number; // Days since last asked to be considered "forgotten"
  forgottenCardChance: number; // Probability (0-1) of showing a forgotten card
}

export const DEFAULT_SETTINGS: AppSettings = {
  wrongCardMultiplier: 3,
  correctCardDivisor: 2,
  forgottenCardThreshold: 7,
  forgottenCardChance: 0.2,
};

const STORAGE_KEY_SETTINGS = 'hanki-settings';
const STORAGE_KEY_DECK_SETTINGS = 'hanki-deck-settings';

// Calculate accuracy from correct/incorrect counts
export function calculateAccuracy(correctCount: number, incorrectCount: number): number {
  const total = correctCount + incorrectCount;
  if (total === 0) return 0;
  return correctCount / total;
}

// Get progress from flashcard data (stored in CSV)
export function getCardProgressFromFlashcard(
  accuracy: number,
  lastAsked: number | null
): CardProgress {
  // We can't perfectly reconstruct counts from accuracy alone,
  // but we can estimate for display purposes
  // For the algorithm, we'll use accuracy directly
  return {
    correctCount: 0, // Not stored in CSV
    incorrectCount: 0, // Not stored in CSV
    lastAsked,
    lastCorrect: null, // Not stored in CSV
  };
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

export function getDeckSettings(deckFilename: string): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  const stored = localStorage.getItem(STORAGE_KEY_DECK_SETTINGS);
  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  const deckSettings: Record<string, AppSettings> = JSON.parse(stored);
  return deckSettings[deckFilename] || DEFAULT_SETTINGS;
}

export function saveDeckSettings(deckFilename: string, settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEY_DECK_SETTINGS);
  const deckSettings: Record<string, AppSettings> = stored ? JSON.parse(stored) : {};
  deckSettings[deckFilename] = settings;
  localStorage.setItem(STORAGE_KEY_DECK_SETTINGS, JSON.stringify(deckSettings));
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  // Note: Progress is now stored in CSV files, not localStorage
  // This function is kept for backwards compatibility but does nothing
}

