import { MermaidDiagram } from '@lyric-js/react-renderer';
import type React from 'react';
import { ALL_EXAMPLES } from '../examples';

export const Gallery: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Example Gallery</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_EXAMPLES.map((example) => (
          <div
            key={example.id}
            className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {example.title}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 mb-3 overflow-auto max-h-40">
              <pre className="text-xs text-gray-700 dark:text-gray-300">{example.code}</pre>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <MermaidDiagram code={example.code} theme="light" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
