'use client';

import { useState, useEffect, useRef } from 'react';
import type { Flashcard } from '@/lib/csvParser';
import { calculateAccuracy } from '@/lib/storage';
import MathText from './MathText';

interface FlashcardProps {
  card: Flashcard;
  onNext: () => void;
  onAnswer: (updatedCard: Flashcard, isCorrect: boolean) => void;
}

export default function FlashcardComponent({ card, onNext, onAnswer }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [answerResult, setAnswerResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isEntering, setIsEntering] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);

  // Animate card entering from left
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 500);
    return () => clearTimeout(timer);
  }, [card.id]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (answered) return;
    
    // Calculate new accuracy as a running average
    // If this is the first time, accuracy is 1 if correct, 0 if incorrect
    // Otherwise, calculate as (previous_accuracy * previous_count + new_result) / (previous_count + 1)
    const now = Date.now();
    const previousAccuracy = card.accuracy || 0;
    
    let newAccuracy: number;
    if (card.lastAsked === null) {
      // First time answering this card
      newAccuracy = isCorrect ? 1 : 0;
    } else {
      // We need to estimate previous count from accuracy
      // If accuracy is 0, we know all were wrong
      // If accuracy is 1, we know all were right
      // Otherwise, we estimate based on a minimum count
      // For a more accurate system, we'd store count separately, but for simplicity:
      // Use exponential moving average with adaptive weight
      const weight = 0.2; // Weight for new answer (lower = more stable)
      newAccuracy = previousAccuracy * (1 - weight) + (isCorrect ? 1 : 0) * weight;
      
      // Ensure accuracy stays between 0 and 1
      newAccuracy = Math.max(0, Math.min(1, newAccuracy));
    }

    const updatedCard: Flashcard = {
      ...card,
      accuracy: newAccuracy,
      lastAsked: now,
    };

    onAnswer(updatedCard, isCorrect);
    setAnswered(true);
    setAnswerResult(isCorrect ? 'correct' : 'incorrect');
    setIsAnimating(true);

    // Auto-advance after animation
    setTimeout(() => {
      handleNext();
    }, 800); // Animation duration + small delay
  };

  const handleNext = () => {
    setShowAnswer(false);
    setAnswered(false);
    setDragOffset(0);
    setIsAnimating(false);
    setAnswerResult(null);
    onNext();
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Enter to show answer
      if (e.key === 'Enter' && !showAnswer) {
        e.preventDefault();
        handleShowAnswer();
        return;
      }

      // Only handle arrow keys when answer is shown and not answered
      if (!showAnswer || answered) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, answered, card]);

  // Drag handlers
  const handleDragStart = (clientX: number) => {
    if (!showAnswer || answered) return;
    setIsDragging(true);
    dragStartRef.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || dragStartRef.current === null) return;
    const offset = clientX - dragStartRef.current;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const threshold = 100; // Minimum drag distance to trigger answer
    if (dragOffset > threshold) {
      // Swiped right - correct
      handleAnswer(true);
    } else if (dragOffset < -threshold) {
      // Swiped left - incorrect
      handleAnswer(false);
    } else {
      // Didn't drag far enough, just reset
      setIsDragging(false);
      setDragOffset(0);
      dragStartRef.current = null;
    }
  };

  // Mouse drag handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartRef.current !== null) {
        const offset = e.clientX - dragStartRef.current;
        setDragOffset(offset);
      }
    };

    const handleMouseUp = () => {
      const threshold = 100;
      if (dragOffset > threshold) {
        handleAnswer(true);
      } else if (dragOffset < -threshold) {
        handleAnswer(false);
      } else {
        setIsDragging(false);
        setDragOffset(0);
        dragStartRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, showAnswer, answered]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showAnswer || answered) return;
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showAnswer || answered) return;
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleDragMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Calculate drag color and opacity
  const getDragStyle = () => {
    if (!isDragging || Math.abs(dragOffset) < 10) return {};
    
    const opacity = Math.min(Math.abs(dragOffset) / 200, 0.3);
    const backgroundColor = dragOffset > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    
    return {
      transform: `translateX(${dragOffset}px)`,
      backgroundColor,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-2xl">
        <div
          ref={cardRef}
          onClick={!showAnswer ? handleShowAnswer : undefined}
          onMouseDown={showAnswer && !answered ? handleMouseDown : undefined}
          onTouchStart={showAnswer && !answered ? handleTouchStart : undefined}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={getDragStyle()}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-6 min-h-[300px] flex flex-col justify-center relative transition-all duration-500 ease-in-out ${
            !showAnswer ? 'cursor-pointer hover:shadow-2xl' : ''
          } ${showAnswer && !answered ? 'cursor-grab active:cursor-grabbing select-none' : ''} ${
            isEntering
              ? '-translate-y-full opacity-0'
              : isAnimating
              ? answerResult === 'correct'
                ? 'translate-x-full opacity-0 bg-green-50 dark:bg-green-900/20'
                : '-translate-x-full opacity-0 bg-red-50 dark:bg-red-900/20'
              : 'translate-y-0 translate-x-0 opacity-100'
          }`}
        >
          {/* Drag feedback overlay */}
          {isDragging && Math.abs(dragOffset) > 10 && (
            <div
              className={`absolute inset-0 rounded-lg flex items-center justify-center text-2xl font-bold z-10 ${
                dragOffset > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {dragOffset > 0 ? 'Correct' : 'Incorrect'}
            </div>
          )}

          {/* Answer result overlay */}
          {isAnimating && answerResult && (
            <div
              className={`absolute inset-0 rounded-lg flex items-center justify-center text-4xl font-bold z-20 ${
                answerResult === 'correct' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              {answerResult === 'correct' ? 'Correct!' : 'Incorrect'}
            </div>
          )}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Question
            </h2>
            <div className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              <MathText text={card.question} />
            </div>
          </div>

          {showAnswer && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Answer
              </h2>
              <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                <MathText text={card.answer} />
              </div>
            </div>
          )}

          {!showAnswer && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Click card to reveal answer</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!showAnswer ? (
            <button
              onClick={handleShowAnswer}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Show Answer
            </button>
          ) : (
            !answered && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Incorrect
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Correct
                </button>
              </div>
            )
          )}

          {/* Keyboard hints */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {!showAnswer ? (
                <>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 font-mono">
                    Enter
                  </kbd>
                  <span>or click to reveal answer</span>
                </>
              ) : !answered ? (
                <>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 font-mono">
                      ←
                    </kbd>
                    <span>Incorrect</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 font-mono">
                      →
                    </kbd>
                    <span>Correct</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>or drag card</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

