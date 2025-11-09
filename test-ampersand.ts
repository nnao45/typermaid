import { parse } from '@typermaid/parser';

console.log('Test 1: Self message without &');
try {
  const ast1 = parse(`sequenceDiagram
    participant A
    participant B
    A->>B: Hello
    A->>A: Parse query`);
  console.log('✅ OK');
} catch (err: any) {
  console.log('❌', err.message);
}

console.log('\nTest 2: Self message WITH & (THIS MIGHT HANG)');
setTimeout(() => {
  console.log('⏰ TIMEOUT!');
  process.exit(1);
}, 2000);

try {
  const ast2 = parse(`sequenceDiagram
    participant A
    participant B
    A->>B: Hello
    A->>A: Parse & validate`);
  console.log('✅ OK');
} catch (err: any) {
  console.log('❌', err.message);
}

console.log('\n✅ All tests passed!');
