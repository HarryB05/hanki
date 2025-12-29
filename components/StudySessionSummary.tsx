'use client';

interface StudySessionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  onStudyAgain: () => void;
  stats: {
    cardsStudied: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    timeSpent: number; // in seconds
    streak: number;
  };
}

export default function StudySessionSummary({
  isOpen,
  onClose,
  onStudyAgain,
  stats,
}: StudySessionSummaryProps) {
  if (!isOpen) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Study Session Complete
        </h2>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Cards Studied</div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {stats.cardsStudied}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Correct</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.correctAnswers}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-red-600 dark:text-red-400 mb-1">Incorrect</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats.incorrectAnswers}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {(stats.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.accuracy * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Best Streak</div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {stats.streak}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Time Spent</div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatTime(stats.timeSpent)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Decks
          </button>
          <button
            onClick={onStudyAgain}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Study Again
          </button>
        </div>
      </div>
    </div>
  );
}

