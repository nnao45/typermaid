const { readdirSync, readFileSync, statSync } = require('fs');
const { join } = require('path');
const { parse } = require('../packages/parser/dist/index.js');
const { generateCode } = require('../packages/codegen/dist/index.js');

const E2E_DIR = __dirname;

function getE2EFiles() {
  const files = [];
  const entries = readdirSync(E2E_DIR);

  for (const entry of entries) {
    const fullPath = join(E2E_DIR, entry);
    let stat;

    try {
      stat = statSync(fullPath);
    } catch (err) {
      continue;
    }

    if (!stat.isDirectory() || entry === 'fixtures') {
      continue;
    }

    const subEntries = readdirSync(fullPath);

    for (const subEntry of subEntries) {
      if (subEntry.endsWith('.mmd')) {
        const mmdPath = join(fullPath, subEntry);
        try {
          const content = readFileSync(mmdPath, 'utf-8');
          files.push({ name: subEntry, path: mmdPath, content, category: entry });
        } catch (err) {
          console.error('ERROR reading file:', subEntry, err.message);
        }
      }
    }
  }

  return files;
}

console.log('Loading files...');
const testFiles = getE2EFiles();
console.log(`Loaded ${testFiles.length} files\n`);

console.log('Running roundtrip tests (starting from file 150)...');
let passed = 0;
let failed = 0;
const startTime = Date.now();
const START_INDEX = 149; // Start from 150th file (0-indexed)

for (let i = START_INDEX; i < testFiles.length; i++) {
  const file = testFiles[i];

  // Log every file to see where it hangs
  console.log(`[${i + 1}/${testFiles.length}] Testing: ${file.category}/${file.name}`);

  try {
    // Step 1: Parse original code
    const ast1 = parse(file.content);

    // Step 2: Generate code from AST
    const generated = generateCode(ast1);

    // Step 3: Parse generated code
    const ast2 = parse(generated);

    // Step 4: Validate
    if (ast2.body.length !== ast1.body.length) {
      throw new Error(`Body length mismatch: ${ast2.body.length} !== ${ast1.body.length}`);
    }

    if (ast2.body[0].type !== ast1.body[0].type) {
      throw new Error(`Type mismatch: ${ast2.body[0].type} !== ${ast1.body[0].type}`);
    }

    passed++;
    console.log(`  ✓ PASSED`);
  } catch (err) {
    failed++;
    console.error(`  ✗ FAILED: ${err.message}`);
  }
}

const endTime = Date.now();
const duration = endTime - startTime;

console.log('\n=== Results ===');
console.log(`Passed: ${passed}/${testFiles.length}`);
console.log(`Failed: ${failed}/${testFiles.length}`);
console.log(`Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
console.log(`Average: ${(duration / testFiles.length).toFixed(2)}ms per file`);
