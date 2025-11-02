import type React from 'react';

interface ExampleSelectorProps {
  examples: Array<{ id: string; title: string; code: string }>;
  onSelect: (code: string) => void;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({ examples, onSelect }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Example:
      </label>
      <select
        onChange={(e) => {
          const example = examples.find((ex) => ex.id === e.target.value);
          if (example) onSelect(example.code);
        }}
        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">-- Select an example --</option>
        {examples.map((example) => (
          <option key={example.id} value={example.id}>
            {example.title}
          </option>
        ))}
      </select>
    </div>
  );
};
