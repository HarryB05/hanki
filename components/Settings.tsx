'use client';

import { useState, useEffect } from 'react';
import {
  getSettings,
  saveSettings,
  getDeckSettings,
  saveDeckSettings,
  clearProgress,
  type AppSettings,
} from '@/lib/storage';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: () => void;
  deckFilename?: string | null;
}

export default function Settings({
  isOpen,
  onClose,
  onSettingsChange,
  deckFilename,
}: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetDeckConfirm, setShowResetDeckConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (deckFilename) {
        setSettings(getDeckSettings(deckFilename));
      } else {
        setSettings(getSettings());
      }
    }
  }, [isOpen, deckFilename]);

  const handleSave = () => {
    if (deckFilename) {
      saveDeckSettings(deckFilename, settings);
    } else {
      saveSettings(settings);
    }
    onSettingsChange();
    onClose();
  };

  const handleClearProgress = () => {
    clearProgress();
    setShowClearConfirm(false);
    onSettingsChange();
  };

  const handleResetDeckProgress = async () => {
    if (!deckFilename) return;

    setIsResetting(true);
    try {
      const response = await fetch(`/api/decks/${deckFilename}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset deck progress');
      }

      setShowResetDeckConfirm(false);
      onSettingsChange();
      alert('Deck progress has been reset');
    } catch (error) {
      console.error('Failed to reset deck progress:', error);
      alert('Failed to reset deck progress. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
              {deckFilename && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Deck-specific settings</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wrong Card Multiplier: {settings.wrongCardMultiplier.toFixed(1)}x
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                How much more often to show cards you get wrong
              </p>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={settings.wrongCardMultiplier}
                onChange={(e) =>
                  setSettings({ ...settings, wrongCardMultiplier: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correct Card Divisor: {settings.correctCardDivisor.toFixed(1)}x
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                How much less often to show cards you get right
              </p>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={settings.correctCardDivisor}
                onChange={(e) =>
                  setSettings({ ...settings, correctCardDivisor: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Forgotten Card Threshold: {settings.forgottenCardThreshold} days
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Days since last asked to be considered "forgotten"
              </p>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={settings.forgottenCardThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, forgottenCardThreshold: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Forgotten Card Chance: {(settings.forgottenCardChance * 100).toFixed(0)}%
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Probability of showing a forgotten card when available
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.forgottenCardChance}
                onChange={(e) =>
                  setSettings({ ...settings, forgottenCardChance: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Danger Zone</h3>
              
              {deckFilename && (
                <div className="mb-4">
                  {!showResetDeckConfirm ? (
                    <button
                      onClick={() => setShowResetDeckConfirm(true)}
                      disabled={isResetting}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:bg-red-400 dark:disabled:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Reset Deck Progress
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Are you sure? This will reset all progress for this deck (accuracy and last asked times).
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleResetDeckProgress}
                          disabled={isResetting}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:bg-red-400 dark:disabled:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          {isResetting ? 'Resetting...' : 'Yes, Reset Progress'}
                        </button>
                        <button
                          onClick={() => setShowResetDeckConfirm(false)}
                          disabled={isResetting}
                          className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!deckFilename && (
                <>
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Clear All Progress
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Are you sure? This will delete all your progress data.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleClearProgress}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Yes, Clear Progress
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

