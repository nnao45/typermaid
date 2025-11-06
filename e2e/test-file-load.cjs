const { readdirSync, readFileSync, statSync } = require('fs');
const { join } = require('path');

const E2E_DIR = __dirname;
const files = [];

console.log('Starting file scan...');
const entries = readdirSync(E2E_DIR);

for (const entry of entries) {
  const fullPath = join(E2E_DIR, entry);
  let stat;

  try {
    stat = statSync(fullPath);
  } catch (err) {
    console.log('Skip:', entry, '(cannot stat)');
    continue;
  }

  if (!stat.isDirectory() || entry === 'fixtures') {
    continue;
  }

  console.log('\nScanning category:', entry);
  const subEntries = readdirSync(fullPath);
  let count = 0;

  for (const subEntry of subEntries) {
    if (subEntry.endsWith('.mmd')) {
      const mmdPath = join(fullPath, subEntry);
      try {
        const content = readFileSync(mmdPath, 'utf-8');
        files.push({ name: subEntry, path: mmdPath, category: entry, size: content.length });
        count++;

        if (count % 10 === 0) {
          console.log(`  Loaded ${count} files...`);
        }
      } catch (err) {
        console.error('  ERROR reading file:', subEntry, err.message);
      }
    }
  }
  console.log(`  Category ${entry}: ${count} files loaded`);
}

console.log('\n=== Summary ===');
console.log('Total files loaded:', files.length);
console.log('Total size:', files.reduce((sum, f) => sum + f.size, 0), 'bytes');

// Find largest files
const largest = files.sort((a, b) => b.size - a.size).slice(0, 5);
console.log('\nLargest files:');
largest.forEach(f => {
  console.log(`  ${f.category}/${f.name}: ${f.size} bytes`);
});
