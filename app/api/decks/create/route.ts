import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { DeckMetadata } from '@/lib/decks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, name, description, category, colour, tags } = body;

    if (!filename || !name) {
      return NextResponse.json(
        { error: 'Filename and name are required' },
        { status: 400 }
      );
    }

    const fileKey = filename.replace('.csv', '');
    const metadataPath = join(process.cwd(), 'public', 'decks.json');

    // Load existing metadata
    let metadata: Record<string, DeckMetadata> = {};
    try {
      const metadataContent = await readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      // File doesn't exist, start with empty object
    }

    // Create new deck metadata
    metadata[fileKey] = {
      csvFile: `/${filename}`,
      name,
      description: description?.trim() || undefined,
      category: category?.trim() || undefined,
      colour: colour || undefined,
      tags: tags?.length > 0 ? tags : undefined,
      maxStreak: 0,
    };

    // Save metadata
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

    return NextResponse.json({ success: true, metadata: metadata[fileKey] });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}

