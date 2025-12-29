import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { parseCSV, generateCSV, type Flashcard } from '@/lib/csvParser';

export async function GET(
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
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading deck:', error);
    return NextResponse.json({ error: 'Failed to read deck' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename.endsWith('.csv')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const body = await request.json();
    const flashcards: Flashcard[] = body.flashcards;

    if (!Array.isArray(flashcards)) {
      return NextResponse.json({ error: 'Invalid flashcards data' }, { status: 400 });
    }

    const csvContent = generateCSV(flashcards);
    const filePath = join(process.cwd(), 'public', filename);
    await writeFile(filePath, csvContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving deck:', error);
    return NextResponse.json({ error: 'Failed to save deck' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename.endsWith('.csv')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', filename);
    
    // Delete the CSV file
    await unlink(filePath);

    // Also remove from decks.json metadata
    try {
      const metadataPath = join(process.cwd(), 'public', 'decks.json');
      const metadataContent = await readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      const fileKey = filename.replace('.csv', '');
      delete metadata[fileKey];
      
      await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    } catch (error) {
      // If decks.json doesn't exist or has issues, that's okay
      console.log('Could not update decks.json:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
}

