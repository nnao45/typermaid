import type React from 'react';

interface HeaderProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onThemeToggle, isDark }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lyric-JS</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Type-safe Mermaid Parser & Renderer
            </p>
          </div>
          <button
            type="button"
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label="Toggle theme"
          >
            {isDark ? '🌞' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};
