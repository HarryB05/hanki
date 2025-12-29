import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const subjectsPath = join(process.cwd(), 'public', 'subjects.json');
    const subjectsContent = await readFile(subjectsPath, 'utf-8');
    const subjects = JSON.parse(subjectsContent);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error loading subjects:', error);
    return NextResponse.json([]);
  }
}

