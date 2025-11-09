import { parse } from '@typermaid/parser';

console.log('Test: Exact names from bug report');
setTimeout(() => {
  console.log('⏰ TIMEOUT!');
  process.exit(1);
}, 2000);

const content = `sequenceDiagram
    participant Client
    participant GraphQLServer
    Client->>GraphQLServer: Query
    GraphQLServer->>GraphQLServer: Parse & validate query`;

try {
  const ast = parse(content);
  console.log('✅ OK -', ast.body[0].diagram.statements.length, 'statements');
} catch (err: any) {
  console.log('❌', err.message);
}
