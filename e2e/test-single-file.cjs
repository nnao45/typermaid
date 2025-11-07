const { readFileSync } = require('node:fs');
const { parse } = require('../packages/parser/dist/index.js');
const { generateCode } = require('../packages/codegen/dist/index.js');

const filePath = '/home/nnao45/ghq/github.com/nnao45/lyric-js/e2e/flowchart/100_complete.mmd';
const content = readFileSync(filePath, 'utf-8');

console.log('File:', filePath);
console.log('Content length:', content.length);
console.log('\n--- Step 1: Parsing original code ---');
const ast1 = parse(content);
console.log('✓ Parse successful');
console.log('AST body length:', ast1.body.length);
console.log('Diagram type:', ast1.body[0].type);

console.log('\n--- Step 2: Generating code from AST ---');
const generated = generateCode(ast1);
console.log('✓ Generate successful');
console.log('Generated length:', generated.length);
console.log('Generated code:');
console.log(generated);

console.log('\n--- Step 3: Parsing generated code ---');
const ast2 = parse(generated);
console.log('✓ Parse generated code successful');
console.log('AST2 body length:', ast2.body.length);

console.log('\n✓ ALL STEPS COMPLETED');
