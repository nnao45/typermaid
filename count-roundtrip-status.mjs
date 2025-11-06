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

for (const cat of categories) {
  const dir = join('e2e', cat);
  const files = readdirSync(dir).filter(f => f.endsWith('.mmd')).slice(0, 10); // First 10 only
  
  let passed = 0, failed = 0;
  for (const file of files) {
    try {
      const code = readFileSync(join(dir, file), 'utf-8');
      const ast1 = parse(code);
      const generated = generateCode(ast1);
      const ast2 = parse(generated);
      
      if (JSON.stringify(removeLoc(ast1)) === JSON.stringify(removeLoc(ast2))) {
        passed++;
      } else {
        failed++;
      }
    } catch (e) {
      failed++;
    }
  }
  stats[cat] = { passed, failed, total: passed + failed };
}

console.log('\n📊 Roundtrip Test Summary (First 10 files per category):\n');
for (const [cat, s] of Object.entries(stats)) {
  const pct = ((s.passed / s.total) * 100).toFixed(1);
  console.log(`${cat.padEnd(12)}: ${s.passed}/${s.total} passed (${pct}%)`);
}

const totalPassed = Object.values(stats).reduce((sum, s) => sum + s.passed, 0);
const totalTests = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
const totalPct = ((totalPassed / totalTests) * 100).toFixed(1);

console.log(`\n${'Total'.padEnd(12)}: ${totalPassed}/${totalTests} passed (${totalPct}%)`);
