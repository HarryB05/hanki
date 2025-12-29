'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">How to Use Hanki</h1>
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
            >
              ← Back to Decks
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Hanki
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Hanki is a spaced repetition flashcard application designed to help you learn and retain
              information more effectively. This guide will walk you through all the features and how
              to get the most out of your study sessions.
            </p>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Getting Started
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Adding Your First Deck
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  To get started, you need to add CSV files to the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">public</code> folder
                  of your project. Each CSV file should have the following format:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`Question,Answer
"What is the capital of France?","Paris"
"What is 2 + 2?","4"`}
                  </pre>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  After adding a CSV file, refresh the page and you'll see it appear in your deck list.
                </p>
                <div className="my-4">
                  <Image
                    src="/screenshots/ss1.png"
                    alt="Deck selector page showing a deck with Setup Required badge"
                    width={1200}
                    height={800}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Setting Up a Deck */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Setting Up a Deck
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                When you first add a CSV file, you'll need to configure it with metadata. Click on a
                deck with the "Setup Required" badge to open the setup modal.
              </p>
              <div className="space-y-2">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Deck Name</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Give your deck a memorable name that describes its content.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Add an optional description to help you remember what this deck covers.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Category</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Select or type a category to organise your decks (e.g., "Mathematics", "Languages").
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Colour</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Choose a colour to visually distinguish this deck from others.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Tags</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Add tags by typing and pressing Enter. Tags help you filter and organise decks.
                  </p>
                </div>
              </div>
              <div className="my-4">
                <Image
                  src="/screenshots/ss2.png"
                  alt="Create New Deck modal with all fields filled in"
                  width={1200}
                  height={800}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </section>

          {/* Studying Cards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Studying Flashcards
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Once your deck is set up, click on it to start studying. The spaced repetition algorithm
                will show you cards based on your performance and when you last studied them.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Viewing a Card</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  When a card appears, you'll see the question first. You can:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Click the card or press <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Enter</kbd> to reveal the answer</li>
                  <li>Click the "Show Answer" button</li>
                </ul>
              </div>

              <div className="my-4">
                <Image
                  src="/screenshots/ss3.png"
                  alt="Flashcard showing just the question"
                  width={1200}
                  height={800}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full h-auto"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Answering a Card</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  After revealing the answer, you can mark it as correct or incorrect:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Click "Correct" or press <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">→</kbd> (right arrow)</li>
                  <li>Click "Incorrect" or press <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">←</kbd> (left arrow)</li>
                  <li>Drag the card left (incorrect) or right (correct) on touch devices</li>
                </ul>
              </div>

              <div className="my-4">
                <Image
                  src="/screenshots/ss4.png"
                  alt="Flashcard with answer revealed showing Incorrect and Correct buttons"
                  width={1200}
                  height={800}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </section>

          {/* Deck Statistics */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Understanding Deck Statistics
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Each deck card displays comprehensive statistics to help you track your progress:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Total Cards</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    The total number of flashcards in the deck.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Studied</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Number of cards you've studied at least once.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Mastered</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Cards with accuracy ≥ 80%.
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">New</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Cards you haven't studied yet.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Needs Review</h4>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Cards with low accuracy (&lt; 50%) or not studied in the last 7 days.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Other Statistics</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li><strong>Learning Progress:</strong> Average accuracy across all studied cards</li>
                  <li><strong>Best Streak:</strong> Your longest consecutive correct answer streak</li>
                  <li><strong>Last Studied:</strong> When you last studied this deck</li>
                </ul>
              </div>

              <div className="my-4">
                <Image
                  src="/screenshots/ss5.png"
                  alt="Fully configured deck card showing all statistics"
                  width={1200}
                  height={800}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </section>

          {/* Settings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Customising Settings
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                You can customise the spaced repetition algorithm to match your learning style. Click
                the "Settings" button in the header while studying a deck.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Available Settings</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>
                    <strong>Wrong Card Multiplier:</strong> How much more often to show cards you get wrong
                    (1x - 10x). Higher values mean difficult cards appear more frequently.
                  </li>
                  <li>
                    <strong>Correct Card Divisor:</strong> How much less often to show cards you get right
                    (1x - 10x). Higher values mean correct cards appear less frequently.
                  </li>
                  <li>
                    <strong>Forgotten Card Threshold:</strong> Days since last asked to be considered
                    "forgotten" (1 - 30 days).
                  </li>
                  <li>
                    <strong>Forgotten Card Chance:</strong> Probability of showing a forgotten card when
                    available (0% - 100%).
                  </li>
                </ul>
              </div>

              <div className="my-4">
                <Image
                  src="/screenshots/ss6.png"
                  alt="Settings modal showing all sliders with current values"
                  width={1200}
                  height={800}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </section>

          {/* Editing Decks */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Editing Decks
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                You can edit a deck's metadata at any time by clicking the edit icon (pencil) in the
                top-right corner of a deck card.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">What You Can Edit</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Deck name</li>
                  <li>Description</li>
                  <li>Category</li>
                  <li>Colour</li>
                  <li>Tags</li>
                </ul>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Note: You cannot edit the actual flashcard content from here. To modify cards,
                  edit the CSV file directly.
                </p>
              </div>

              <div className="my-4">
                <Image
                  src="/screenshots/ss7.png"
                  alt="Edit Deck modal with fields modified"
                  width={1200}
                  height={800}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full h-auto"
                />
              </div>

            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Keyboard Shortcuts
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    While Viewing Question
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Enter</kbd> - Reveal answer
                    </li>
                    <li>Click card - Reveal answer</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    While Viewing Answer
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">←</kbd> - Mark as incorrect
                    </li>
                    <li>
                      <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">→</kbd> - Mark as correct
                    </li>
                    <li>Drag card left/right - Mark as incorrect/correct</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Happy studying with Hanki
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

