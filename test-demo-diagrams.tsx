import React from 'react';
import { MermaidDiagram } from './packages/react-renderer/src/components/MermaidDiagram';

// Test each diagram type
const examples = [
  {
    name: 'Flowchart',
    code: `flowchart TB
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]`,
  },
  {
    name: 'Subgraph',
    code: `flowchart TB
    c1-->a2
    subgraph one
    a1-->a2
    end`,
  },
  {
    name: 'Sequence',
    code: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!`,
  },
  {
    name: 'ER Diagram',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`,
  },
];

export function TestDiagrams() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  return (
    <div style={{ padding: '20px' }}>
      <h1>Diagram Type Test</h1>
      {examples.map((example) => (
        <div
          key={example.name}
          style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px' }}
        >
          <h2>{example.name}</h2>
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>{example.code}</pre>
          <div style={{ border: '1px solid #ddd', padding: '20px', minHeight: '300px' }}>
            <MermaidDiagram
              code={example.code}
              theme="light"
              onError={(err) => {
                console.error(`Error in ${example.name}:`, err);
                setErrors((prev) => ({ ...prev, [example.name]: err.message }));
              }}
            />
          </div>
          {errors[example.name] && (
            <div style={{ color: 'red', marginTop: '10px' }}>Error: {errors[example.name]}</div>
          )}
        </div>
      ))}
    </div>
  );
}
