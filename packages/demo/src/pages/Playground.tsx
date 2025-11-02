import type React from 'react';
import { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { DiagramViewer } from '../components/DiagramViewer';
import { ExampleSelector } from '../components/ExampleSelector';
import { ALL_EXAMPLES } from '../examples';

const DEFAULT_CODE = `flowchart TB
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`;

export const Playground: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_CODE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Interactive Playground
      </h2>

      <ExampleSelector examples={ALL_EXAMPLES} onSelect={setCode} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mermaid Code</h3>
          <CodeEditor value={code} onChange={setCode} />
        </div>

        <div>
          <DiagramViewer code={code} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Tip</h4>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Edit the Mermaid code on the left to see real-time preview on the right. Try selecting an
          example from the dropdown above!
        </p>
      </div>
    </div>
  );
};
