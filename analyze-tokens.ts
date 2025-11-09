// Direct implementation to analyze tokens
import { readFileSync } from 'node:fs';

const tokenizerCode = readFileSync('/home/nnao45/ghq/github.com/nnao45/typermaid/packages/parser/dist/lexer/sequence-tokenizer.js', 'utf-8');

// Import tokenizer from built dist
const module = await import('@typermaid/parser/dist/lexer/sequence-tokenizer.js');
const SequenceTokenizer = module.SequenceTokenizer;

const testCases = [
  {
    name: 'Working case (Server)',
    code: `sequenceDiagram
    participant Server
    Server->>Server: Message`
  },
  {
    name: 'Hanging case (GraphQL)',
    code: `sequenceDiagram
    participant GraphQL
    GraphQL->>GraphQL: Message`
  }
];

for (const tc of testCases) {
  console.log(`\n=== ${tc.name} ===`);
  console.log('Code:', tc.code.replace(/\n/g, '\\n'));
  
  try {
    const tokenizer = new SequenceTokenizer(tc.code);
    const tokens = tokenizer.tokenize();
    
    console.log(`\nTotal tokens: ${tokens.length}`);
    tokens.forEach((token, i) => {
      console.log(`  ${i.toString().padStart(2)}: ${token.type.padEnd(20)} "${token.value}"`);
    });
  } catch (err: any) {
    console.log('ERROR:', err.message);
  }
}
