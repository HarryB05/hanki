'use client';

import { useState } from 'react';
import type { Flashcard } from '@/lib/csvParser';

export type StudyMode = 'all' | 'new' | 'review' | 'mastered';

interface StudyModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: StudyMode) => void;
  flashcards: Flashcard[];
}

export default function StudyModeSelector({
  isOpen,
  onClose,
  onSelectMode,
  flashcards,
}: StudyModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<StudyMode>('all');

  if (!isOpen) return null;

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const stats = {
    all: flashcards.length,
    new: flashcards.filter((card) => card.lastAsked === null).length,
    review: flashcards.filter(
      (card) =>
        card.lastAsked !== null &&
        (card.accuracy < 0.5 || card.lastAsked < sevenDaysAgo)
    ).length,
    mastered: flashcards.filter(
      (card) => card.lastAsked !== null && card.accuracy >= 0.8
    ).length,
  };

  const handleStart = () => {
    onSelectMode(selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Select Study Mode
        </h2>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelectedMode('all')}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedMode === 'all'
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Review All</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Study all cards in the deck
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {stats.all}
              </span>
            </div>
          </button>

          <button
            onClick={() => setSelectedMode('new')}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedMode === 'new'
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">New Cards Only</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Study cards you haven't seen yet
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {stats.new}
              </span>
            </div>
          </button>

          <button
            onClick={() => setSelectedMode('review')}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedMode === 'review'
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Review Mode</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cards needing review (low accuracy or not studied recently)
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {stats.review}
              </span>
            </div>
          </button>

          <button
            onClick={() => setSelectedMode('mastered')}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedMode === 'mastered'
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Mastered Cards</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review cards you've mastered (accuracy ≥ 80%)
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {stats.mastered}
              </span>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={stats[selectedMode] === 0}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Start Studying
          </button>
        </div>
      </div>
    </div>
  );
}

