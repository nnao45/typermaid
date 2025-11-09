import { parse } from '@typermaid/parser';

const tests = [
  { name: 'Short names', code: `sequenceDiagram
    participant A
    participant B
    A->>B: Q
    B->>B: Self` },
  
  { name: 'GraphQL name', code: `sequenceDiagram
    participant GraphQL
    participant Server
    GraphQL->>Server: Q
    GraphQL->>GraphQL: Self` },
    
  { name: 'GraphQLServer name', code: `sequenceDiagram
    participant GraphQLServer
    participant Other
    GraphQLServer->>Other: Q
    GraphQLServer->>GraphQLServer: Self` },
];

for (const test of tests) {
  console.log(`\nTest: ${test.name}`);
  
  const timeout = setTimeout(() => {
    console.log('⏰ TIMEOUT!');
    process.exit(1);
  }, 1000);
  
  try {
    const ast = parse(test.code);
    clearTimeout(timeout);
    console.log('✅ OK');
  } catch (err: any) {
    clearTimeout(timeout);
    console.log('❌', err.message);
  }
}

console.log('\n✅ All done!');
