import { MermaidDiagram } from '@typermaid/react-renderer';
import type React from 'react';
import { useState } from 'react';

interface DiagramViewerProps {
  code: string;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ code }) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Preview</h3>
      <div className="overflow-auto" style={{ minHeight: '400px' }}>
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded">
            <h4 className="font-bold mb-2">Error:</h4>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        ) : (
          <MermaidDiagram code={code} theme="light" onError={(err) => setError(err.message)} />
        )}
      </div>
    </div>
  );
};
