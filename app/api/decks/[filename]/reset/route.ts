import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parseCSV, generateCSV, type Flashcard } from '@/lib/csvParser';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename.endsWith('.csv')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', filename);
    const content = await readFile(filePath, 'utf-8');
    const cards = parseCSV(content);

    // Reset all progress (set accuracy to 0 and lastAsked to null)
    const resetCards: Flashcard[] = cards.map((card) => ({
      ...card,
      accuracy: 0,
      lastAsked: null,
    }));

    const csvContent = generateCSV(resetCards);
    await writeFile(filePath, csvContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting deck progress:', error);
    return NextResponse.json({ error: 'Failed to reset deck progress' }, { status: 500 });
  }
}

