import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const fileKey = filename.replace('.csv', '');
    
    const metadataPath = join(process.cwd(), 'public', 'decks.json');
    const metadataContent = await readFile(metadataPath, 'utf-8');
    const metadata: Record<string, any> = JSON.parse(metadataContent);
    
    const maxStreak = metadata[fileKey]?.maxStreak || 0;
    return NextResponse.json({ maxStreak });
  } catch (error) {
    console.error('Error reading max streak:', error);
    return NextResponse.json({ maxStreak: 0 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const fileKey = filename.replace('.csv', '');
    
    const body = await request.json();
    const { maxStreak } = body;
    
    if (typeof maxStreak !== 'number' || maxStreak < 0) {
      return NextResponse.json({ error: 'Invalid maxStreak value' }, { status: 400 });
    }

    const metadataPath = join(process.cwd(), 'public', 'decks.json');
    const metadataContent = await readFile(metadataPath, 'utf-8');
    const metadata: Record<string, any> = JSON.parse(metadataContent);
    
    // Ensure the deck entry exists
    if (!metadata[fileKey]) {
      metadata[fileKey] = {};
    }
    
    metadata[fileKey].maxStreak = maxStreak;
    
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, maxStreak });
  } catch (error) {
    console.error('Error saving max streak:', error);
    return NextResponse.json({ error: 'Failed to save max streak' }, { status: 500 });
  }
}

