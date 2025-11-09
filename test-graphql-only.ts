import { parse } from '@typermaid/parser';

console.log('Testing GraphQL case with detailed debug...\n');

const content = `sequenceDiagram
    participant GraphQL
    GraphQL->>GraphQL: Message`;

setTimeout(() => {
  console.log('\n⏰ TIMEOUT - Parser hung!');
  process.exit(1);
}, 3000);

try {
  console.log('Starting parse...');
  const ast = parse(content);
  console.log('✅ Parse succeeded!');
  console.log('Statements:', ast.body[0].diagram.statements.length);
} catch (err: any) {
  console.log('❌ Error:', err.message);
}
