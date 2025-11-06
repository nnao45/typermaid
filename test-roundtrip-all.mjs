#!/usr/bin/env node
/**
 * Test roundtrip for all E2E files
 * Code → Parse → AST → Generate → Code
 */

import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const E2E_DIR = './e2e';
const categories = ['flowchart', 'sequence', 'class', 'er', 'state', 'gantt'];

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

for (const category of categories) {
  const dir = join(E2E_DIR, category);
  const files = readdirSync(dir).filter(f => f.endsWith('.mmd'));
  
  console.log(`\n📂 Testing ${category}: ${files.length} files`);
  
  for (const file of files) {
    totalTests++;
    const filePath = join(dir, file);
    const originalCode = readFileSync(filePath, 'utf-8').trim();
    
    try {
      // Step 1: Parse original code
      const ast1 = parse(originalCode);
      
      // Step 2: Generate code from AST
      const generatedCode = generateCode(ast1);
      
      // Step 3: Parse generated code
      const ast2 = parse(generatedCode);
      
      // Step 4: Compare ASTs (simple JSON comparison)
      const ast1Str = JSON.stringify(ast1, null, 2);
      const ast2Str = JSON.stringify(ast2, null, 2);
      
      if (ast1Str === ast2Str) {
        passedTests++;
        process.stdout.write('.');
      } else {
        failedTests.push({
          file: `${category}/${file}`,
          error: 'AST mismatch after roundtrip'
        });
        process.stdout.write('F');
      }
    } catch (error) {
      failedTests.push({
        file: `${category}/${file}`,
        error: error.message
      });
      process.stdout.write('E');
    }
  }
  console.log('');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests.length}`);
console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests.length > 0) {
  console.log('\n❌ Failed tests:');
  for (const fail of failedTests.slice(0, 20)) {
    console.log(`  - ${fail.file}: ${fail.error}`);
  }
  if (failedTests.length > 20) {
    console.log(`  ... and ${failedTests.length - 20} more`);
  }
  process.exit(1);
} else {
  console.log('\n✅ All roundtrip tests passed! 🎉');
  process.exit(0);
}
