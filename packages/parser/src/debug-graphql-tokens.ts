import { SequenceTokenizer } from './lexer/sequence-tokenizer.js';

const content = `sequenceDiagram
    participant GraphQL
    GraphQL->>GraphQL: Message`;

console.log('Tokenizing GraphQL case...\n');
const tokenizer = new SequenceTokenizer(content);
const tokens = tokenizer.tokenize();

console.log(`Total tokens: ${tokens.length}\n`);
tokens.forEach((token, i) => {
  console.log(`[${i}] ${token.type.padEnd(20)} "${token.value.replace(/\n/g, '\\n')}"`);
});
