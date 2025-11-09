import { parse } from '@typermaid/parser';

const problematic = `sequenceDiagram
    participant Client
    participant GraphQLServer
    Client->>GraphQLServer: Query
    GraphQLServer->>GraphQLServer: Parse & validate query`;

console.log('Testing with debug...');

try {
  const ast = parse(problematic);
  console.log('✅ Success!', ast.body[0].diagram.statements.length, 'statements');
} catch (err: any) {
  console.log('❌ Error:', err.message);
  if (err.message.includes('Infinite loop')) {
    console.log('\n�� CAUGHT THE INFINITE LOOP!');
  }
}
