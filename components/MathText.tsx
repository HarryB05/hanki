'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
}

type PartType = 'text' | 'math' | 'code';

interface TextPart {
  type: PartType;
  content: string;
}

export default function MathText({ text, className = '' }: MathTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Parse text for math ($...$) and inline code (`...`)
    const parts: TextPart[] = [];
    let currentIndex = 0;
    let i = 0;

    while (i < text.length) {
      // Look for backtick (inline code) - has priority over $
      if (text[i] === '`' && (i === 0 || text[i - 1] !== '\\')) {
        let j = i + 1;
        while (j < text.length && text[j] !== '`') {
          if (text[j] === '\\' && j + 1 < text.length) {
            j += 2; // Skip escaped characters
          } else {
            j++;
          }
        }

        if (j < text.length) {
          // Found matching backtick
          // Add text before code
          if (i > currentIndex) {
            parts.push({ type: 'text', content: text.slice(currentIndex, i) });
          }
          // Add code content
          parts.push({ type: 'code', content: text.slice(i + 1, j) });
          currentIndex = j + 1;
          i = j + 1;
          continue;
        }
      }

      // Look for $ delimiter (not escaped)
      if (text[i] === '$' && (i === 0 || text[i - 1] !== '\\')) {
        // Check if it's the start of a math block
        let j = i + 1;
        while (j < text.length && text[j] !== '$') {
          if (text[j] === '\\' && j + 1 < text.length) {
            j += 2; // Skip escaped characters
          } else {
            j++;
          }
        }

        if (j < text.length) {
          // Found matching $
          // Add text before math
          if (i > currentIndex) {
            parts.push({ type: 'text', content: text.slice(currentIndex, i) });
          }
          // Add math content
          parts.push({ type: 'math', content: text.slice(i + 1, j) });
          currentIndex = j + 1;
          i = j + 1;
          continue;
        }
      }
      i++;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(currentIndex) });
    }

    // Render the parts
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (part.type === 'math') {
        try {
          const span = document.createElement('span');
          katex.render(part.content.trim(), span, {
            throwOnError: false,
            displayMode: false,
          });
          fragment.appendChild(span);
        } catch (error) {
          // If KaTeX fails, just show the raw text
          const span = document.createElement('span');
          span.textContent = `$${part.content}$`;
          fragment.appendChild(span);
        }
      } else if (part.type === 'code') {
        const code = document.createElement('code');
        code.className = 'bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono';
        code.textContent = part.content;
        fragment.appendChild(code);
      } else {
        // Preserve whitespace and line breaks
        // Replace \n with <br> for line breaks
        const lines = part.content.split('\n');
        lines.forEach((line, index) => {
          if (index > 0) {
            fragment.appendChild(document.createElement('br'));
          }
          if (line) {
            fragment.appendChild(document.createTextNode(line));
          }
        });
      }
    });

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(fragment);
  }, [text]);

  return <div ref={containerRef} className={className} />;
}

