const { readFileSync } = require('node:fs');
const { parse } = require('../packages/parser/dist/index.js');

const filePath = '/home/nnao45/ghq/github.com/nnao45/lyric-js/e2e/flowchart/100_complete.mmd';
const content = readFileSync(filePath, 'utf-8');

console.log('=== Content ===');
console.log(content);

console.log('\n=== Starting parse with timeout ===');
try {
  // Add timeout to detect hang
  const timeout = setTimeout(() => {
    console.error('\n!!! PARSER HUNG - TIMEOUT AFTER 5 SECONDS !!!');
    process.exit(1);
  }, 5000);

  console.log('Calling parse()...');
  const ast = parse(content);
  clearTimeout(timeout);

  console.log('\n✓ Parse completed successfully!');
  console.log('AST body length:', ast.body.length);
  console.log('AST type:', ast.type);
  console.log('First diagram type:', ast.body[0]?.type);
} catch (err) {
  console.error('\n✗ Error:', err.message);
  if (err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
}
