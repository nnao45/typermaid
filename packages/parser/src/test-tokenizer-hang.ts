import { SequenceTokenizer } from './lexer/sequence-tokenizer.js';

console.log('Testing tokenizer directly...\n');

const content = `sequenceDiagram
    participant GraphQL
    GraphQL->>GraphQL: Message`;

console.log('Content:');
console.log(content);
console.log('\nTokenizing...');

setTimeout(() => {
  console.log('\n⏰ TOKENIZER TIMEOUT!');
  process.exit(1);
}, 2000);

try {
  const tokenizer = new SequenceTokenizer(content);
  const tokens = tokenizer.tokenize();
  
  console.log(`\n✅ Success! Got ${tokens.length} tokens`);
  tokens.forEach((t, i) => {
    console.log(`[${i}] ${t.type} "${t.value.replace(/\n/g, '\\n')}"`);
  });
} catch (err: any) {
  console.log('\n❌ Error:', err.message);
}
