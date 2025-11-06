import { parse } from './packages/parser/dist/index.js';
import { generateCode } from './packages/codegen/dist/index.js';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function removeLoc(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeLoc);
  const result = {};
  for (const key in obj) {
    if (key !== 'loc') result[key] = removeLoc(obj[key]);
  }
  return result;
}

const categories = ['flowchart', 'sequence', 'class', 'er', 'state', 'gantt'];
const stats = {};
const failures = [];

console.log('Testing roundtrip for all E2E files...\n');

for (const cat of categories) {
  const dir = join('e2e', cat);
  const files = readdirSync(dir).filter(f => f.endsWith('.mmd'));
  
  let passed = 0, failed = 0;
  process.stdout.write(`${cat.padEnd(12)}: `);
  
  for (const file of files) {
    try {
      const code = readFileSync(join(dir, file), 'utf-8');
      const ast1 = parse(code);
      const generated = generateCode(ast1);
      const ast2 = parse(generated);
      
      if (JSON.stringify(removeLoc(ast1)) === JSON.stringify(removeLoc(ast2))) {
        passed++;
        process.stdout.write('.');
      } else {
        failed++;
        process.stdout.write('F');
        failures.push({ cat, file, reason: 'AST mismatch' });
      }
    } catch (e) {
      failed++;
      process.stdout.write('E');
      failures.push({ cat, file, reason: e.message });
    }
  }
  console.log(`\n               ${passed}/${passed + failed} passed`);
  stats[cat] = { passed, failed, total: passed + failed };
}

console.log(`\n${'='.repeat(60)}`);
console.log('📊 Summary:\n');
for (const [cat, s] of Object.entries(stats)) {
  const pct = ((s.passed / s.total) * 100).toFixed(1);
  console.log(`${cat.padEnd(12)}: ${s.passed.toString().padStart(3)}/${s.total.toString().padStart(3)} passed (${pct.padStart(5)}%)`);
}

const totalPassed = Object.values(stats).reduce((sum, s) => sum + s.passed, 0);
const totalTests = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
const totalPct = ((totalPassed / totalTests) * 100).toFixed(1);

console.log(`${'─'.repeat(30)}`);
console.log(`${'Total'.padEnd(12)}: ${totalPassed.toString().padStart(3)}/${totalTests.toString().padStart(3)} passed (${totalPct.padStart(5)}%)`);

if (failures.length > 0 && failures.length <= 20) {
  console.log(`\n❌ Failed tests (${failures.length}):\n`);
  for (const f of failures) {
    console.log(`  ${f.cat}/${f.file}: ${f.reason.substring(0, 60)}`);
  }
} else if (failures.length > 20) {
  console.log(`\n❌ ${failures.length} tests failed (showing first 20):\n`);
  for (const f of failures.slice(0, 20)) {
    console.log(`  ${f.cat}/${f.file}`);
  }
}
