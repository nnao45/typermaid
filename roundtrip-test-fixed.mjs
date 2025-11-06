import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readFileSync } from 'node:fs';

function removeLoc(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeLoc);
  
  const result = {};
  for (const key in obj) {
    if (key !== 'loc') {
      result[key] = removeLoc(obj[key]);
    }
  }
  return result;
}

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
  console.log(`\n📝 ${test.name}`);
  
  const code = readFileSync(test.file, 'utf-8').trim();
  
  try {
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    const clean1 = removeLoc(ast1);
    const clean2 = removeLoc(ast2);
    
    const match = JSON.stringify(clean1) === JSON.stringify(clean2);
    
    console.log('   Original:\n  ', code.split('\n').join('\n   '));
    console.log('   Generated:\n  ', generated.split('\n').join('\n   '));
    console.log('  ', match ? '✅ PASS' : '❌ FAIL');
    
    if (match) {
      passed++;
    } else {
      failed++;
    }
  } catch (e) {
    console.log('   ❌ ERROR:', e.message);
    failed++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`✨ Summary: ${passed}/6 passed (${(passed/6*100).toFixed(1)}%)`);
console.log('='.repeat(60));
process.exit(failed > 0 ? 1 : 0);
