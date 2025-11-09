import { parse } from '@typermaid/parser';

console.log('Test 1: Just participants');
try {
  const ast1 = parse(`sequenceDiagram
    participant A
    participant B`);
  console.log('✅ OK');
} catch (err: any) {
  console.log('❌', err.message);
}

console.log('\nTest 2: One message');
try {
  const ast2 = parse(`sequenceDiagram
    participant A
    participant B
    A->>B: Hello`);
  console.log('✅ OK');
} catch (err: any) {
  console.log('❌', err.message);
}

console.log('\nTest 3: Self message alone');
try {
  const ast3 = parse(`sequenceDiagram
    participant A
    A->>A: Self`);
  console.log('✅ OK');
} catch (err: any) {
  console.log('❌', err.message);
}

console.log('\nTest 4: Message then self (THIS SHOULD HANG)');
setTimeout(() => {
  console.log('⏰ TIMEOUT!');
  process.exit(1);
}, 2000);

try {
  const ast4 = parse(`sequenceDiagram
    participant A
    participant B
    A->>B: Hello
    A->>A: Self`);
  console.log('✅ OK');
} catch (err: any) {
  console.log('❌', err.message);
}
