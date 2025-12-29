import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { DeckMetadata } from '@/lib/decks';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const body = await request.json();
    const { name, description, category, colour, tags } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const fileKey = filename.replace('.csv', '');
    const metadataPath = join(process.cwd(), 'public', 'decks.json');

    // Load existing metadata
    let metadata: Record<string, DeckMetadata> = {};
    try {
      const metadataContent = await readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      return NextResponse.json({ error: 'Metadata file not found' }, { status: 404 });
    }

    // Update deck metadata
    if (!metadata[fileKey]) {
      metadata[fileKey] = { csvFile: `/${filename}` };
    }

    metadata[fileKey] = {
      ...metadata[fileKey],
      name,
      description: description?.trim() || undefined,
      category: category?.trim() || undefined,
      colour: colour || undefined,
      tags: tags?.length > 0 ? tags : undefined,
    };

    // Save metadata
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

    return NextResponse.json({ success: true, metadata: metadata[fileKey] });
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}

