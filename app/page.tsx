'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FlashcardComponent from '@/components/Flashcard';
import Settings from '@/components/Settings';
import DeckSelector from '@/components/DeckSelector';
import ThemeToggle from '@/components/ThemeToggle';
import StudyModeSelector, { type StudyMode } from '@/components/StudyModeSelector';
import StudySessionSummary from '@/components/StudySessionSummary';
import { parseCSV, type Flashcard } from '@/lib/csvParser';
import { selectNextCard } from '@/lib/spacedRepetition';

export default function Home() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [currentDeck, setCurrentDeck] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeckSelector, setShowDeckSelector] = useState(true);
  const [settingsKey, setSettingsKey] = useState(0); // Force re-render when settings change
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [previousBestStreak, setPreviousBestStreak] = useState(0);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [hasBeatenStreak, setHasBeatenStreak] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>('all');
  const [showStudyModeSelector, setShowStudyModeSelector] = useState(false);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    timeSpent: 0,
    streak: 0,
  });
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const sessionStartTime = useRef<number | null>(null);
  const sessionCorrectCount = useRef(0);
  const sessionIncorrectCount = useRef(0);
  const sessionCardsStudied = useRef(0);
  const shownCardIds = useRef<Set<string>>(new Set());
  const initialCardCount = useRef(0);

  const loadMaxStreak = async (deckFilename: string): Promise<number> => {
    try {
      const response = await fetch(`/api/decks/${deckFilename}/streak`);
      if (!response.ok) return 0;
      const data = await response.json();
      return data.maxStreak || 0;
    } catch (error) {
      console.error('Failed to load max streak:', error);
      return 0;
    }
  };

  const saveMaxStreak = async (deckFilename: string, streak: number): Promise<void> => {
    try {
      await fetch(`/api/decks/${deckFilename}/streak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxStreak: streak }),
      });
    } catch (error) {
      console.error('Failed to save max streak:', error);
    }
  };

  const filterCardsByMode = (cards: Flashcard[], mode: StudyMode): Flashcard[] => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    switch (mode) {
      case 'new':
        return cards.filter((card) => card.lastAsked === null);
      case 'review':
        return cards.filter(
          (card) =>
            card.lastAsked !== null &&
            (card.accuracy < 0.5 || card.lastAsked < sevenDaysAgo)
        );
      case 'mastered':
        return cards.filter(
          (card) => card.lastAsked !== null && card.accuracy >= 0.8
        );
      case 'all':
      default:
        return cards;
    }
  };

  const loadDeck = async (filename: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/decks/${filename}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load deck: ${response.statusText}`);
      }
      const data = await response.json();
      const cards = parseCSV(data.content);
      setFlashcards(cards);
      setCurrentDeck(filename);
      setCurrentStreak(0);
      const maxStreakValue = await loadMaxStreak(filename);
      setMaxStreak(maxStreakValue);
      setPreviousBestStreak(maxStreakValue);
      setHasBeatenStreak(false);
      
      // Show study mode selector
      setShowStudyModeSelector(true);
    } catch (error) {
      console.error('Failed to load deck:', error);
      alert(`Failed to load deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startStudySession = (mode: StudyMode, resetShownCards = true) => {
    setStudyMode(mode);
    const filtered = filterCardsByMode(flashcards, mode);
    setFilteredFlashcards(filtered);
    
    // Reset session stats
    sessionStartTime.current = Date.now();
    sessionCorrectCount.current = 0;
    sessionIncorrectCount.current = 0;
    sessionCardsStudied.current = 0;
    
    // Reset shown cards if starting a new session
    if (resetShownCards) {
      shownCardIds.current = new Set();
    }
    
    // Store initial card count for progress tracking
    initialCardCount.current = filtered.length;
    
    // Get cards that haven't been shown yet
    const availableCards = filtered.filter((card) => !shownCardIds.current.has(card.id));
    
    if (availableCards.length > 0) {
      const nextCard = selectNextCard(availableCards, currentDeck || undefined);
      if (nextCard) {
        shownCardIds.current.add(nextCard.id);
        setCurrentCard(nextCard);
        setShowDeckSelector(false);
        setShowStudyModeSelector(false);
      }
    } else {
      // No more cards available, show summary
      endStudySession();
    }
  };

  const handleDeckSelect = (filename: string) => {
    loadDeck(filename);
  };

  const handleAnswer = async (updatedCard: Flashcard, isCorrect: boolean) => {
    // Update session stats
    sessionCardsStudied.current += 1;
    if (isCorrect) {
      sessionCorrectCount.current += 1;
    } else {
      sessionIncorrectCount.current += 1;
    }

    // Update the card in our local state
    const updatedFlashcards = flashcards.map((card) =>
      card.id === updatedCard.id ? updatedCard : card
    );
    setFlashcards(updatedFlashcards);
    
    // Update filtered flashcards - re-filter in case card status changed
    const updatedFiltered = filterCardsByMode(updatedFlashcards, studyMode);
    setFilteredFlashcards(updatedFiltered);

    // Update streak
    if (isCorrect) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      
      // Check if this is a new max streak
      if (newStreak > maxStreak && currentDeck) {
        // Save the old max as previous best before updating
        const oldMax = maxStreak;
        if (oldMax > 0) {
          setPreviousBestStreak(oldMax);
          setHasBeatenStreak(true);
        }
        setMaxStreak(newStreak);
        await saveMaxStreak(currentDeck, newStreak);
      }
    } else {
      // If we got one wrong and had just beaten our streak, show celebration
      if (hasBeatenStreak && currentStreak > 0) {
        setShowStreakCelebration(true);
        setTimeout(() => setShowStreakCelebration(false), 3000);
      }
      setCurrentStreak(0);
      setHasBeatenStreak(false);
    }

    // Save to CSV file via API
    try {
      await fetch(`/api/decks/${currentDeck}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flashcards: updatedFlashcards }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleNext = () => {
    // Update filtered cards based on current study mode (in case cards changed)
    const filtered = filterCardsByMode(flashcards, studyMode);
    setFilteredFlashcards(filtered);
    
    // Get cards that haven't been shown yet
    const availableCards = filtered.filter((card) => !shownCardIds.current.has(card.id));
    
    if (availableCards.length > 0) {
      const nextCard = selectNextCard(availableCards, currentDeck || undefined);
      if (nextCard) {
        shownCardIds.current.add(nextCard.id);
        setCurrentCard(nextCard);
      }
    } else {
      // No more cards available, show session summary
      endStudySession();
    }
  };

  const handleSettingsChange = async () => {
    // Force re-selection of card with new settings
    setSettingsKey((prev) => prev + 1);
    
    // Reload deck if we have one to refresh stats
    if (currentDeck) {
      await loadDeck(currentDeck);
    } else if (flashcards.length > 0) {
      setCurrentCard(selectNextCard(flashcards, currentDeck || undefined));
    }
  };

  const endStudySession = () => {
    if (sessionStartTime.current) {
      const timeSpent = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      const totalAnswers = sessionCorrectCount.current + sessionIncorrectCount.current;
      const accuracy = totalAnswers > 0 ? sessionCorrectCount.current / totalAnswers : 0;

      setSessionStats({
        cardsStudied: sessionCardsStudied.current,
        correctAnswers: sessionCorrectCount.current,
        incorrectAnswers: sessionIncorrectCount.current,
        accuracy,
        timeSpent,
        streak: maxStreak,
      });
      setShowSessionSummary(true);
    }
  };

  const handleBackToDecks = () => {
    // End session and show summary if we were studying
    if (sessionStartTime.current && sessionCardsStudied.current > 0) {
      endStudySession();
      return;
    }

    setShowDeckSelector(true);
    setCurrentDeck(null);
    setFlashcards([]);
    setFilteredFlashcards([]);
    setCurrentCard(null);
    setCurrentStreak(0);
    setMaxStreak(0);
    setHasBeatenStreak(false);
    setStudyMode('all');
    setShowStudyModeSelector(false);
    sessionStartTime.current = null;
    sessionCorrectCount.current = 0;
    sessionIncorrectCount.current = 0;
    sessionCardsStudied.current = 0;
    shownCardIds.current = new Set();
  };

  const handleSessionSummaryClose = () => {
    setShowSessionSummary(false);
    setShowDeckSelector(true);
    setCurrentDeck(null);
    setFlashcards([]);
    setFilteredFlashcards([]);
    setCurrentCard(null);
    setCurrentStreak(0);
    setMaxStreak(0);
    setHasBeatenStreak(false);
    setStudyMode('all');
    setShowStudyModeSelector(false);
    sessionStartTime.current = null;
    sessionCorrectCount.current = 0;
    sessionIncorrectCount.current = 0;
    sessionCardsStudied.current = 0;
    shownCardIds.current = new Set();
  };

  const handleStudyAgain = () => {
    setShowSessionSummary(false);
    // Reset shown cards and restart with the same mode
    startStudySession(studyMode, true);
  };

  if (showDeckSelector) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hanki</h1>
              <div className="flex items-center gap-4">
                <Link
                  href="/how-to-use"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                >
                  How to Use
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DeckSelector onDeckSelect={handleDeckSelect} currentDeck={currentDeck} />
        </div>

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-900 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Made by{' '}
              <a
                href="https://harrybarnish.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
              >
                Harry Barnish
              </a>
            </p>
          </div>
        </footer>
        
        <StudyModeSelector
          isOpen={showStudyModeSelector}
          onClose={() => {
            setShowStudyModeSelector(false);
          }}
          onSelectMode={startStudySession}
          flashcards={flashcards}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">No flashcards found.</p>
          <button
            onClick={handleBackToDecks}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Decks
          </button>
        </div>
      </div>
    );
  }

  // Calculate deck progress (only when studying)
  const isStudying = !showDeckSelector && !showStudyModeSelector && currentCard !== null;
  const totalCards = initialCardCount.current;
  const cardsCompleted = shownCardIds.current.size;
  const progressPercent = isStudying && totalCards > 0 ? (cardsCompleted / totalCards) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDecks}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
              >
                ← Back to Decks
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hanki</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Streak Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-orange-600 dark:text-orange-500">{currentStreak}</span>
                  {maxStreak > 0 && (
                    <span className="text-gray-400 dark:text-gray-500 mx-2">/ {maxStreak}</span>
                  )}
                </div>
                <div className="relative w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  {/* Progress bar */}
                  {(() => {
                    const maxValue = Math.max(currentStreak, maxStreak, 1);
                    const currentPercent = (currentStreak / maxValue) * 100;
                    const previousBestPercent = previousBestStreak > 0 
                      ? (previousBestStreak / maxValue) * 100 
                      : 0;
                    
                    return (
                      <>
                        {/* Previous best streak marker */}
                        {previousBestStreak > 0 && previousBestStreak < maxValue && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 dark:bg-blue-400 z-10"
                            style={{ left: `${previousBestPercent}%` }}
                            title={`Previous best: ${previousBestStreak}`}
                          />
                        )}
                        {/* Current streak progress */}
                        <div
                          className="h-full bg-orange-500 dark:bg-orange-600 rounded-full transition-all duration-300"
                          style={{ width: `${currentPercent}%` }}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>
              <ThemeToggle />
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
          
          {/* Deck Progress Bar - Only show when studying */}
          {isStudying && totalCards > 0 && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {cardsCompleted} / {totalCards}
              </div>
              <div className="flex-1 max-w-md">
                <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {Math.round(progressPercent)}%
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Streak Celebration */}
      {showStreakCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">New Record!</div>
              <div className="text-xl">Max Streak: {maxStreak}</div>
            </div>
          </div>
        </div>
      )}

      {currentCard && (
        <FlashcardComponent
          key={`${settingsKey}-${currentCard.id}`}
          card={currentCard}
          onNext={handleNext}
          onAnswer={(card, isCorrect) => handleAnswer(card, isCorrect)}
        />
      )}

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
        deckFilename={currentDeck}
      />

      <StudyModeSelector
        isOpen={showStudyModeSelector}
        onClose={() => {
          setShowStudyModeSelector(false);
          setShowDeckSelector(true);
        }}
        onSelectMode={startStudySession}
        flashcards={flashcards}
      />

      <StudySessionSummary
        isOpen={showSessionSummary}
        onClose={handleSessionSummaryClose}
        onStudyAgain={handleStudyAgain}
        stats={sessionStats}
      />

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Made by{' '}
            <a
              href="https://harrybarnish.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
            >
              Harry Barnish
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

