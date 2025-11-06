import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const categories = ['flowchart', 'sequence', 'state', 'class', 'er', 'gantt'];
const results = {};

for (const category of categories) {
  const dir = `e2e/${category}`;
  const files = readdirSync(dir).filter(f => f.endsWith('.mmd'));
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(join(dir, file), 'utf-8');
      const ast1 = parse(content);
      const generated = generateCode(ast1);
      const ast2 = parse(generated);
      
      if (ast1.body.length === ast2.body.length && ast1.body[0]?.type === ast2.body[0]?.type) {
        passed++;
      } else {
        failed++;
        failures.push({ file, reason: 'AST mismatch' });
      }
    } catch (err) {
      failed++;
      failures.push({ file, reason: err.message });
    }
  }
  
  results[category] = { total: files.length, passed, failed, failures };
}

console.log('\n=== Round-trip Test Summary ===\n');
let totalPassed = 0;
let totalFailed = 0;

for (const [category, result] of Object.entries(results)) {
  totalPassed += result.passed;
  totalFailed += result.failed;
  const percent = (result.passed / result.total * 100).toFixed(1);
  console.log(`${category}: ${result.passed}/${result.total} (${percent}%)`);
  if (result.failed > 0) {
    console.log(`  Failed: ${result.failures.slice(0, 3).map(f => f.file).join(', ')}${result.failures.length > 3 ? '...' : ''}`);
  }
}

const totalPercent = (totalPassed / (totalPassed + totalFailed) * 100).toFixed(1);
console.log(`\nTotal: ${totalPassed}/${totalPassed + totalFailed} (${totalPercent}%)`);
