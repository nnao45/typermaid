import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readFileSync } from 'node:fs';

const tests = [
  { file: 'e2e/flowchart/001_quality.mmd', name: 'Flowchart' },
  { file: 'e2e/sequence/001_basic_actors.mmd', name: 'Sequence' },
  { file: 'e2e/class/001_basic.mmd', name: 'Class' },
  { file: 'e2e/er/001_basic.mmd', name: 'ER' },
  { file: 'e2e/state/001_basic.mmd', name: 'State' },
  { file: 'e2e/gantt/001_basic.mmd', name: 'Gantt' }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 ${test.name}: ${test.file}`);
  console.log('='.repeat(60));
  
  const code = readFileSync(test.file, 'utf-8').trim();
  
  try {
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    const match = JSON.stringify(ast1) === JSON.stringify(ast2);
    
    console.log('📄 Original:\n', code);
    console.log('\n�� Generated:\n', generated);
    console.log('\n', match ? '✅ PASS' : '❌ FAIL');
    
    if (match) {
      passed++;
    } else {
      failed++;
      console.log('\n🔍 AST1:', JSON.stringify(ast1, null, 2).substring(0, 500));
      console.log('\n🔍 AST2:', JSON.stringify(ast2, null, 2).substring(0, 500));
    }
  } catch (e) {
    console.log('❌ ERROR:', e.message);
    failed++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));
