'use client';

import { useState, useEffect } from 'react';
import type { Deck } from '@/lib/decks';
import { listDecks } from '@/lib/decks';
import CreateDeckModal from './CreateDeckModal';
import EditDeckModal from './EditDeckModal';

interface DeckSelectorProps {
  onDeckSelect: (filename: string) => void;
  currentDeck: string | null;
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getColourClasses(colour?: string): string {
  const colourMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/30',
  };
  return colourMap[colour || 'blue'] || 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800';
}

type SortOption = 'name' | 'lastStudied' | 'cardCount' | 'accuracy' | 'streak';

export default function DeckSelector({ onDeckSelect, currentDeck }: DeckSelectorProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingDeck, setPendingDeck] = useState<Deck | null>(null);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setIsLoading(true);
    try {
      const deckList = await listDecks();
      setDecks(deckList);
      setFilteredDecks(deckList);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort decks
  useEffect(() => {
    let filtered = [...decks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((deck) =>
        deck.name.toLowerCase().includes(query) ||
        deck.description?.toLowerCase().includes(query) ||
        deck.category?.toLowerCase().includes(query) ||
        deck.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastStudied':
          return (b.lastStudied || 0) - (a.lastStudied || 0);
        case 'cardCount':
          return (b.cardCount || 0) - (a.cardCount || 0);
        case 'accuracy':
          return (b.averageAccuracy || 0) - (a.averageAccuracy || 0);
        case 'streak':
          return (b.maxStreak || 0) - (a.maxStreak || 0);
        default:
          return 0;
      }
    });

    setFilteredDecks(filtered);
  }, [decks, searchQuery, sortBy]);

  const handleCreateDeck = async (data: {
    name: string;
    description?: string;
    category?: string;
    colour?: string;
    tags?: string[];
  }) => {
    if (!pendingDeck) return;

    try {
      const response = await fetch('/api/decks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: pendingDeck.filename,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deck');
      }

      setShowCreateModal(false);
      setPendingDeck(null);
      // Reload decks
      await loadDecks();
    } catch (error) {
      console.error('Failed to create deck:', error);
      alert('Failed to create deck. Please try again.');
    }
  };

  const handleEditDeck = (deck: Deck, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDeck(deck);
    setShowEditModal(true);
  };

  const handleUpdateDeck = async (data: {
    name: string;
    description?: string;
    category?: string;
    colour?: string;
    tags?: string[];
  }) => {
    if (!editingDeck) return;

    try {
      const response = await fetch(`/api/decks/${editingDeck.filename}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update deck');
      }

      setShowEditModal(false);
      setEditingDeck(null);
      // Reload decks
      await loadDecks();
    } catch (error) {
      console.error('Failed to update deck:', error);
      alert('Failed to update deck. Please try again.');
    }
  };

  const handleDeleteDeck = async (filename: string) => {
    try {
      const response = await fetch(`/api/decks/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      setShowDeleteConfirm(null);
      await loadDecks();
    } catch (error) {
      console.error('Failed to delete deck:', error);
      alert('Failed to delete deck. Please try again.');
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading decks...</p>
        </div>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No decks found</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">Add CSV files to the public folder to get started.</p>
      </div>
    );
  }

  if (filteredDecks.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Decks</h1>
          <p className="text-gray-600 dark:text-gray-400">Select a deck to start studying</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search decks by name, description, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No decks match your filters</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Clear Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Decks</h1>
        <p className="text-gray-600 dark:text-gray-400">Select a deck to start studying</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search decks by name, description, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>


        {/* Results count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredDecks.length} of {decks.length} deck{decks.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDecks.map((deck) => (
          <button
            key={deck.filename}
            onClick={() => {
              if (deck.needsSetup) {
                setPendingDeck(deck);
                setShowCreateModal(true);
              } else {
                onDeckSelect(deck.filename);
              }
            }}
            className={`text-left p-6 rounded-lg border-2 transition-all relative ${
              currentDeck === deck.filename
                ? 'ring-4 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-900'
                : getColourClasses(deck.colour)
            } ${deck.needsSetup ? 'border-dashed border-gray-400 dark:border-gray-600' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{deck.name}</h3>
                  {deck.needsSetup && (
                    <span className="bg-yellow-500 dark:bg-yellow-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      Setup Required
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {deck.category && (
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                    {deck.category}
                  </span>
                )}
                {!deck.needsSetup && (
                  <div className="flex items-center gap-1">
                    <div
                    onClick={(e) => handleEditDeck(deck, e)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors cursor-pointer"
                    title="Edit deck"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEditDeck(deck, e as any);
                        }
                      }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(deck.filename);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      title="Delete deck"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setShowDeleteConfirm(deck.filename);
                        }
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {deck.needsSetup ? (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold mb-1">Setup Required</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Click to configure this deck with a name, description, and colour.
                </p>
              </div>
            ) : (
              <>
                {deck.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">{deck.description}</p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Learning Progress</span>
                <span className="font-semibold">
                  {deck.averageAccuracy !== undefined
                    ? `${(deck.averageAccuracy * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      deck.averageAccuracy !== undefined
                        ? Math.max(0, Math.min(100, deck.averageAccuracy * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Statistics
              </h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Cards</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{deck.cardCount || 0}</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Studied</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {deck.cardsStudied ?? 0}
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                  <div className="text-xs text-green-600 dark:text-green-400 mb-1">Mastered</div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">
                    {deck.cardsMastered ?? 0}
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">New</div>
                  <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                    {deck.newCards ?? 0}
                  </div>
                </div>
              </div>

              {deck.cardsNeedingReview !== undefined && deck.cardsNeedingReview > 0 && (
                <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                      Needs Review
                    </span>
                    <span className="text-sm font-bold text-red-700 dark:text-red-400">
                      {deck.cardsNeedingReview}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {deck.maxStreak !== undefined && deck.maxStreak > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Best Streak</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-500">
                      {deck.maxStreak}
                    </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Last Studied</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(deck.lastStudied || null)}
                </span>
                </div>
              </div>
            </div>

            {deck.tags && deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {deck.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      <CreateDeckModal
        isOpen={showCreateModal}
        filename={pendingDeck?.filename || ''}
        onClose={() => {
          setShowCreateModal(false);
          setPendingDeck(null);
        }}
        onSave={handleCreateDeck}
      />

      <EditDeckModal
        isOpen={showEditModal}
        deck={editingDeck}
        onClose={() => {
          setShowEditModal(false);
          setEditingDeck(null);
        }}
        onSave={handleUpdateDeck}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Deck
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this deck? This will permanently delete the deck file
              and all its progress. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDeck(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

