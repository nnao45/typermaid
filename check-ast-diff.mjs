import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'e2e/sequence/001_basic_actors.mmd';
const code = readFileSync(file, 'utf-8').trim();

const ast1 = parse(code);
const generated = generateCode(ast1);
const ast2 = parse(generated);

writeFileSync('ast1.json', JSON.stringify(ast1, null, 2));
writeFileSync('ast2.json', JSON.stringify(ast2, null, 2));

console.log('Wrote ast1.json and ast2.json');
console.log('\nOriginal code:');
console.log(code);
console.log('\nGenerated code:');
console.log(generated);
