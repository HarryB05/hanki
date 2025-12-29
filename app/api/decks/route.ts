import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { parseCSV } from '@/lib/csvParser';
import type { Deck, DeckMetadata } from '@/lib/decks';

async function loadMetadata(): Promise<Record<string, DeckMetadata>> {
  try {
    const metadataPath = join(process.cwd(), 'public', 'decks.json');
    const metadataContent = await readFile(metadataPath, 'utf-8');
    return JSON.parse(metadataContent);
  } catch (error) {
    // If metadata file doesn't exist, return empty object
    return {};
  }
}

function getDefaultName(filename: string): string {
  return filename
    .replace('.csv', '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

async function getDeckStats(filename: string): Promise<{
  cardCount: number;
  lastStudied: number | null;
  averageAccuracy: number;
  cardsStudied: number;
  cardsMastered: number;
  cardsNeedingReview: number;
  newCards: number;
}> {
  try {
    const filePath = join(process.cwd(), 'public', filename);
    const content = await readFile(filePath, 'utf-8');
    const cards = parseCSV(content);

    if (cards.length === 0) {
      return {
        cardCount: 0,
        lastStudied: null,
        averageAccuracy: 0,
        cardsStudied: 0,
        cardsMastered: 0,
        cardsNeedingReview: 0,
        newCards: 0,
      };
    }

    const cardsWithProgress = cards.filter((card) => card.lastAsked !== null);
    const lastStudied =
      cardsWithProgress.length > 0
        ? Math.max(...cardsWithProgress.map((card) => card.lastAsked || 0))
        : null;

    // Calculate average accuracy from all cards that have been studied
    // Include cards with accuracy = 0 (they got it wrong)
    const accuracies = cardsWithProgress.map((card) => card.accuracy);
    const averageAccuracy =
      accuracies.length > 0
        ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
        : 0;

    // Additional statistics
    const cardsStudied = cardsWithProgress.length;
    const newCards = cards.length - cardsStudied;
    
    // Cards mastered: accuracy >= 0.8
    const cardsMastered = cardsWithProgress.filter(
      (card) => card.accuracy >= 0.8
    ).length;

    // Cards needing review: low accuracy (< 0.5) or not studied in last 7 days
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const cardsNeedingReview = cardsWithProgress.filter(
      (card) =>
        card.accuracy < 0.5 ||
        (card.lastAsked !== null && card.lastAsked < sevenDaysAgo)
    ).length;

    return {
      cardCount: cards.length,
      lastStudied,
      averageAccuracy,
      cardsStudied,
      cardsMastered,
      cardsNeedingReview,
      newCards,
    };
  } catch (error) {
    return {
      cardCount: 0,
      lastStudied: null,
      averageAccuracy: 0,
      cardsStudied: 0,
      cardsMastered: 0,
      cardsNeedingReview: 0,
      newCards: 0,
    };
  }
}

export async function GET() {
  try {
    const publicDir = join(process.cwd(), 'public');
    const files = await readdir(publicDir);
    const metadata = await loadMetadata();

    const csvFiles = files.filter((file) => file.endsWith('.csv'));

    const decks: Deck[] = await Promise.all(
      csvFiles.map(async (filename) => {
        const fileKey = filename.replace('.csv', '');
        const meta = metadata[fileKey];
        const stats = await getDeckStats(filename);

        // Check if this CSV needs setup (exists but no metadata)
        const needsSetup = !meta;

        return {
          name: meta?.name || getDefaultName(filename),
          filename,
          description: meta?.description,
          category: meta?.category,
          colour: meta?.colour,
          tags: meta?.tags,
          maxStreak: meta?.maxStreak || 0,
          needsSetup,
          ...stats,
        };
      })
    );

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error listing decks:', error);
    return NextResponse.json([], { status: 500 });
  }
}

