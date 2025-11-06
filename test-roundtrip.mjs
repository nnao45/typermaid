import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readFileSync } from 'fs';

const code = readFileSync('e2e/flowchart/001_quality.mmd', 'utf-8');
console.log('Original code:');
console.log(code);
console.log('\n--- Parsing ---\n');

const ast1 = parse(code);
console.log('AST type:', ast1.type);
console.log('Body length:', ast1.body.length);
if (ast1.body[0]) {
  console.log('First diagram type:', ast1.body[0].type);
}

console.log('\n--- Generating code ---\n');

const generated = generateCode(ast1);
console.log('Generated code:');
console.log(generated);

console.log('\n--- Re-parsing generated code ---\n');

const ast2 = parse(generated);
console.log('AST2 type:', ast2.type);
console.log('Body length:', ast2.body.length);
if (ast2.body[0]) {
  console.log('First diagram type:', ast2.body[0].type);
}

console.log('\n--- Comparison ---\n');
console.log('Types match:', ast1.body[0].type === ast2.body[0].type);
console.log('Body lengths match:', ast1.body.length === ast2.body.length);
