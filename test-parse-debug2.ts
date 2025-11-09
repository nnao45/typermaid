import { parse } from '@typermaid/parser';

const working = `sequenceDiagram
    participant Server
    Server->>Server: Message`;

const hanging = `sequenceDiagram
    participant GraphQL
    GraphQL->>GraphQL: Message`;

console.log('=== WORKING CASE (Server) ===\n');
try {
  const ast1 = parse(working);
  console.log('✅ OK\n');
} catch (err: any) {
  console.log('❌ Error:', err.message, '\n');
}

console.log('\n=== HANGING CASE (GraphQL) ===\n');
setTimeout(() => {
  console.log('\n⏰ TIMEOUT!');
  process.exit(1);
}, 3000);

try {
  const ast2 = parse(hanging);
  console.log('✅ OK');
} catch (err: any) {
  console.log('❌ Error:', err.message);
}
