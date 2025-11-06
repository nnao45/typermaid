import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const E2E_DIR = './e2e';

// Get all .mmd files
function getAllMmdFiles() {
  const files = [];
  const entries = readdirSync(E2E_DIR);
  
  for (const entry of entries) {
    const fullPath = join(E2E_DIR, entry);
    try {
      const stat = statSync(fullPath);
      if (!stat.isDirectory() || entry === 'fixtures') continue;
      
      const subEntries = readdirSync(fullPath);
      for (const subEntry of subEntries) {
        if (subEntry.endsWith('.mmd')) {
          files.push({
            category: entry,
            name: subEntry,
            path: join(fullPath, subEntry)
          });
        }
      }
    } catch (e) {
      // Skip
    }
  }
  
  return files;
}

// Test roundtrip
function testRoundtrip(file) {
  try {
    const content = readFileSync(file.path, 'utf-8');
    
    // Step 1: Parse
    const ast1 = parse(content);
    if (!ast1 || ast1.type !== 'Program') {
      return { success: false, error: 'Parse failed' };
    }
    
    // Step 2: Generate
    const generated = generateCode(ast1);
    if (!generated || generated.length === 0) {
      return { success: false, error: 'Generate failed' };
    }
    
    // Step 3: Parse again
    const ast2 = parse(generated);
    if (!ast2 || ast2.type !== 'Program') {
      return { success: false, error: 'Re-parse failed' };
    }
    
    // Step 4: Validate
    if (ast2.body.length !== ast1.body.length) {
      return { success: false, error: `Body length mismatch: ${ast1.body.length} → ${ast2.body.length}` };
    }
    
    for (let i = 0; i < ast1.body.length; i++) {
      if (ast2.body[i].type !== ast1.body[i].type) {
        return { success: false, error: `Diagram type mismatch at ${i}: ${ast1.body[i].type} → ${ast2.body[i].type}` };
      }
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Main
const files = getAllMmdFiles();
console.log(`🔍 Testing ${files.length} files...\n`);

const results = {};
let totalSuccess = 0;
let totalFailed = 0;

for (const file of files) {
  const result = testRoundtrip(file);
  
  if (!results[file.category]) {
    results[file.category] = { success: 0, failed: 0, errors: [] };
  }
  
  if (result.success) {
    results[file.category].success++;
    totalSuccess++;
  } else {
    results[file.category].failed++;
    totalFailed++;
    results[file.category].errors.push({
      name: file.name,
      error: result.error
    });
  }
}

// Print summary
console.log('📊 Summary by Category:\n');
for (const [category, stats] of Object.entries(results)) {
  const total = stats.success + stats.failed;
  const percentage = ((stats.success / total) * 100).toFixed(1);
  console.log(`  ${category}: ${stats.success}/${total} (${percentage}%) ✅`);
  
  if (stats.failed > 0) {
    for (const err of stats.errors) {
      console.log(`    ❌ ${err.name}: ${err.error}`);
    }
  }
}

console.log(`\n🎯 Overall: ${totalSuccess}/${files.length} (${((totalSuccess / files.length) * 100).toFixed(1)}%)`);

if (totalFailed > 0) {
  console.log(`\n⚠️  ${totalFailed} files failed round-trip test`);
  process.exit(1);
} else {
  console.log('\n✨ All round-trip tests passed! ✨');
  process.exit(0);
}
