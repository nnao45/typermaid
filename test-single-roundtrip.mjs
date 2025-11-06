import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readFileSync } from 'node:fs';

const testFile = 'e2e/flowchart/001_quality.mmd';
const content = readFileSync(testFile, 'utf-8');

console.log('📝 Original code:');
console.log(content);
console.log('\n' + '='.repeat(80) + '\n');

try {
  console.log('🔍 Step 1: Parse original code');
  const ast1 = parse(content);
  console.log('✅ AST1 type:', ast1.type);
  console.log('✅ Diagrams count:', ast1.body.length);
  if (ast1.body.length > 0) {
    console.log('✅ First diagram type:', ast1.body[0].type);
  }
  console.log('\n' + '='.repeat(80) + '\n');

  console.log('🎨 Step 2: Generate code from AST');
  const generated = generateCode(ast1);
  console.log('Generated code:');
  console.log(generated);
  console.log('\n' + '='.repeat(80) + '\n');

  console.log('🔍 Step 3: Parse generated code');
  const ast2 = parse(generated);
  console.log('✅ AST2 type:', ast2.type);
  console.log('✅ Diagrams count:', ast2.body.length);
  if (ast2.body.length > 0) {
    console.log('✅ First diagram type:', ast2.body[0].type);
  }

  console.log('\n✨ Round-trip SUCCESS! ✨\n');
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err);
  process.exit(1);
}
