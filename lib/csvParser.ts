export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  accuracy: number; // 0-1
  lastAsked: number | null; // timestamp
}

export function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField);
  return fields;
}

export function parseCSV(csvContent: string): Flashcard[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  // Parse header to check for progress columns
  const headerFields = parseCSVLine(lines[0]);
  const hasAccuracy = headerFields.includes('Accuracy');
  const hasLastAsked = headerFields.includes('LastAsked');

  // Skip header row
  const dataLines = lines.slice(1);
  const flashcards: Flashcard[] = [];

  dataLines.forEach((line, index) => {
    const fields = parseCSVLine(line);
    
    if (fields.length >= 2) {
      const question = fields[0].trim();
      const answer = fields[1].trim();
      
      if (question && answer) {
        // Extract progress data if present
        let accuracy = 0;
        let lastAsked: number | null = null;

        if (hasAccuracy && fields.length > 2) {
          const accuracyIndex = headerFields.indexOf('Accuracy');
          const accuracyStr = fields[accuracyIndex]?.trim();
          if (accuracyStr) {
            accuracy = parseFloat(accuracyStr) || 0;
          }
        }

        if (hasLastAsked && fields.length > 2) {
          const lastAskedIndex = headerFields.indexOf('LastAsked');
          const lastAskedStr = fields[lastAskedIndex]?.trim();
          if (lastAskedStr) {
            lastAsked = parseInt(lastAskedStr, 10) || null;
          }
        }

        flashcards.push({
          id: `card-${index}`,
          question,
          answer,
          accuracy,
          lastAsked,
        });
      }
    }
  });

  return flashcards;
}

export function generateCSV(flashcards: Flashcard[]): string {
  const header = 'Question,Answer,Accuracy,LastAsked';
  const lines = [header];

  flashcards.forEach((card) => {
    const question = `"${card.question.replace(/"/g, '""')}"`;
    const answer = `"${card.answer.replace(/"/g, '""')}"`;
    const accuracy = (card.accuracy ?? 0).toFixed(4);
    const lastAsked = card.lastAsked?.toString() || '';
    lines.push(`${question},${answer},${accuracy},${lastAsked}`);
  });

  return lines.join('\n');
}

