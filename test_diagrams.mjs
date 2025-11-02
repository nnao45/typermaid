import { parse } from './packages/parser/src/index.js';

const tests = [
  { name: 'sequence', code: 'sequenceDiagram\n    Alice->>John: Hello' },
  { name: 'class', code: 'classDiagram\n    Animal <|-- Duck' },
  { name: 'er', code: 'erDiagram\n    CUSTOMER ||--o{ ORDER : places' },
  { name: 'state', code: 'stateDiagram-v2\n    [*] --> Still' },
  {
    name: 'gantt',
    code: 'gantt\n    title Test\n    dateFormat YYYY-MM-DD\n    section S\n    Task :2024-01-01, 5d',
  },
];

for (const test of tests) {
  try {
    console.log(`\nTesting ${test.name}...`);
    const ast = parse(test.code);
    console.log(`✅ ${test.name}: Success - AST type: ${ast.type}`);
  } catch (error) {
    console.log(`❌ ${test.name}: ${error.message.split('\n')[0]}`);
  }
}
