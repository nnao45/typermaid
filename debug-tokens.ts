import { readFileSync } from 'node:fs';

// Direct import from source
const SequenceTokenizerSrc = readFileSync('packages/parser/src/lexer/sequence-tokenizer.ts', 'utf-8');

const content = `sequenceDiagram
    participant Client
    participant GraphQLServer
    Client->>GraphQLServer: Query
    GraphQLServer->>GraphQLServer: Parse & validate query`;

console.log('Content:');
console.log(content);
console.log('\n--- We need to check what tokens are generated ---');
console.log('Let me check the tokenizer implementation...\n');

// For now, let's just try to understand the structure
const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);
lines.forEach((line, i) => {
  console.log(`Line ${i}: "${line}"`);
});
